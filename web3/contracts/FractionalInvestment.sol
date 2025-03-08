// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableMap.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./EquityNFTFactory.sol";

contract FractionalInvestment is ERC1155, Ownable, ReentrancyGuard {
    using EnumerableMap for EnumerableMap.UintToUintMap;
    
    EquityNFTFactory public immutable equityFactory;
    
    struct Investment {
        uint256 startupId;
        uint256 shares;
        uint256 investmentAmount;
        uint256 timestamp;
        uint256 sharePrice; // Track share price at time of investment
    }
    
    // Platform fee in basis points (100 = 1%)
    uint256 public platformFee = 100;
    address public feeCollector;
    
    // Minimum investment amount in wei
    uint256 public minInvestment;
    
    // Investment tracking
    mapping(uint256 => uint256) public totalInvestment;
    mapping(uint256 => mapping(address => Investment[])) public investments;
    mapping(uint256 => EnumerableMap.UintToUintMap) private _sharePrices;
    mapping(uint256 => address[]) private _tokenHolders;
    mapping(uint256 => mapping(address => bool)) private _isHolder;
    
    event InvestmentMade(
        uint256 indexed startupId,
        address indexed investor,
        uint256 shares,
        uint256 amount,
        uint256 sharePrice
    );
    
    event ProfitDistributed(
        uint256 indexed startupId,
        uint256 amount,
        uint256 timestamp
    );

    event PlatformFeeUpdated(
        uint256 oldFee,
        uint256 newFee
    );

    event FeeCollectorUpdated(
        address oldCollector,
        address newCollector
    );

    constructor(address _equityFactory, address _feeCollector) ERC1155("") {
        equityFactory = EquityNFTFactory(_equityFactory);
        feeCollector = _feeCollector;
        minInvestment = 0.01 ether; // Minimum 0.01 ETH investment
    }

    function invest(uint256 startupId) external payable nonReentrant {
        EquityNFTFactory.Startup memory startup = equityFactory.getStartupDetails(startupId);
        require(startup.isValidated, "Startup not validated");
        require(startup.availableShares > 0, "No shares available");
        require(msg.value >= minInvestment, "Investment below minimum");
        
        uint256 investmentAmount = msg.value;
        
        // Calculate and transfer platform fee
        uint256 fee = (investmentAmount * platformFee) / 10000;
        uint256 netInvestment = investmentAmount - fee;
        
        // Calculate shares with higher precision
        // First multiply by total shares to maintain precision
        uint256 numerator = netInvestment * startup.totalShares;
        uint256 sharesToBuy = numerator / startup.valuation;
        
        require(sharesToBuy > 0, "Investment too small");
        require(sharesToBuy <= startup.availableShares, "Not enough shares available");

        // Calculate share price after determining shares for consistent pricing
        uint256 sharePrice = startup.valuation / startup.totalShares;

        // Transfer fee to fee collector
        if (fee > 0) {
            (bool feeSuccess,) = payable(feeCollector).call{value: fee}("");
            require(feeSuccess, "Fee transfer failed");
        }

        // Transfer investment to startup founder
        (bool founderSuccess,) = payable(startup.founder).call{value: netInvestment}("");
        require(founderSuccess, "Investment transfer failed");

        // Record investment
        investments[startupId][msg.sender].push(Investment({
            startupId: startupId,
            shares: sharesToBuy,
            investmentAmount: netInvestment,
            timestamp: block.timestamp,
            sharePrice: sharePrice
        }));

        totalInvestment[startupId] += netInvestment;
        
        // Mint shares to investor and update startup records
        _mint(msg.sender, startupId, sharesToBuy, "");
        equityFactory.issueShares(startupId, msg.sender, sharesToBuy);
        
        // Store current share price and update token holders list
        _sharePrices[startupId].set(block.timestamp, sharePrice);
        
        // Record holder if not already recorded
        if (!_isHolder[startupId][msg.sender]) {
            _tokenHolders[startupId].push(msg.sender);
            _isHolder[startupId][msg.sender] = true;
        }
        
        emit InvestmentMade(startupId, msg.sender, sharesToBuy, netInvestment, sharePrice);
    }

    function gcd(uint256 a, uint256 b) internal pure returns (uint256) {
        while (b > 0) {
            uint256 temp = b;
            b = a % b;
            a = temp;
        }
        return a;
    }

    function distributeProfit(uint256 startupId) external payable nonReentrant {
        EquityNFTFactory.Startup memory startup = equityFactory.getStartupDetails(startupId);
        require(msg.sender == startup.founder, "Only founder can distribute profits");
        require(msg.value > 0, "No profit to distribute");

        address[] memory holders = _tokenHolders[startupId];
        uint256[] memory shares = new uint256[](holders.length);
        uint256 validHolderCount;
        uint256 totalShares;

        // First pass: get valid holders and their shares
        for (uint256 i = 0; i < holders.length; i++) {
            uint256 holderShares = balanceOf(holders[i], startupId);
            if (holderShares > 0) {
                shares[validHolderCount] = holderShares;
                holders[validHolderCount] = holders[i];
                totalShares += holderShares;
                validHolderCount++;
            }
        }
        
        require(totalShares > 0, "No valid shareholders");
        require(validHolderCount > 0, "No valid holders");

        uint256 totalDistributed;

        // Distribute to all holders except the last one
        for (uint256 i = 0; i < validHolderCount - 1; i++) {
            address holder = holders[i];
            uint256 holderShares = shares[i];
            
            // Calculate profit share maintaining maximum precision
            uint256 profitShare = (msg.value * holderShares) / totalShares;
            
            if (profitShare > 0) {
                (bool success,) = payable(holder).call{value: profitShare}("");
                require(success, "Profit transfer failed");
                totalDistributed += profitShare;
            }
        }

        // Last holder gets the remaining amount
        if (validHolderCount > 0) {
            address lastHolder = holders[validHolderCount - 1];
            uint256 remaining = msg.value - totalDistributed;
            if (remaining > 0) {
                (bool success,) = payable(lastHolder).call{value: remaining}("");
                require(success, "Profit transfer failed");
            }
        }

        emit ProfitDistributed(startupId, msg.value, block.timestamp);
    }

    function getTotalInvestment(uint256 startupId) external view returns (uint256) {
        return totalInvestment[startupId];
    }

    function getInvestorShares(uint256 startupId, address investor) external view returns (uint256) {
        return balanceOf(investor, startupId);
    }

    function getInvestmentHistory(uint256 startupId, address investor) external view returns (Investment[] memory) {
        return investments[startupId][investor];
    }

    function uri(uint256 startupId) public view virtual override returns (string memory) {
        EquityNFTFactory.Startup memory startup = equityFactory.getStartupDetails(startupId);
        return string(abi.encodePacked("ipfs://", startup.name));
    }

    function updatePlatformFee(uint256 newFee) external onlyOwner {
        require(newFee <= 1000, "Fee too high"); // Max 10%
        emit PlatformFeeUpdated(platformFee, newFee);
        platformFee = newFee;
    }

    function updateFeeCollector(address newCollector) external onlyOwner {
        require(newCollector != address(0), "Invalid address");
        emit FeeCollectorUpdated(feeCollector, newCollector);
        feeCollector = newCollector;
    }

    function updateMinInvestment(uint256 newMin) external onlyOwner {
        minInvestment = newMin;
    }

    receive() external payable {}
}