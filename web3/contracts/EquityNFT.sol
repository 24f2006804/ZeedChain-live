// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract EquityNFT is ERC721, ERC721Enumerable, Pausable, AccessControl, ReentrancyGuard, Initializable {
    using Counters for Counters.Counter;

    bytes32 public constant GOVERNANCE_ROLE = keccak256("GOVERNANCE_ROLE");
    bytes32 public constant VALUATION_ROLE = keccak256("VALUATION_ROLE");
    
    uint256 public totalShares;
    uint256 public sharesForSale;
    uint256 public currentValuation;
    address public startupOwner;
    address public immutable factoryAddress;
    
    mapping(address => uint256) public investorShares;
    address[] public investors;
    bool public fundingActive;
    
    Counters.Counter private _tokenIdCounter;
    
    event Investment(address indexed investor, uint256 amount, uint256 shares);
    event ValuationUpdated(uint256 oldValuation, uint256 newValuation);
    event FundsWithdrawn(address indexed recipient, uint256 amount);
    event ProfitsDistributed(uint256 totalAmount);
    
    constructor(address _factoryAddress) ERC721("Startup Equity", "EQTY") {
        factoryAddress = _factoryAddress;
        _grantRole(DEFAULT_ADMIN_ROLE, _factoryAddress);
    }
    
    function initialize(
        address _startupOwner,
        uint256 _totalShares,
        uint256 _initialValuation
    ) external initializer {
        require(msg.sender == factoryAddress, "Only factory can initialize");
        startupOwner = _startupOwner;
        totalShares = _totalShares;
        sharesForSale = _totalShares;
        currentValuation = _initialValuation;
        fundingActive = true;
        
        _grantRole(DEFAULT_ADMIN_ROLE, _startupOwner);
        _grantRole(GOVERNANCE_ROLE, _startupOwner);
    }
    
    function investInStartup(uint256 shareAmount) 
        external 
        payable 
        nonReentrant 
        whenNotPaused 
    {
        require(fundingActive, "Funding is not active");
        require(shareAmount <= sharesForSale, "Not enough shares available");
        require(shareAmount > 0, "Must buy at least one share");
        
        uint256 sharePrice = (currentValuation * shareAmount) / totalShares;
        require(msg.value >= sharePrice, "Insufficient payment");
        
        sharesForSale -= shareAmount;
        investorShares[msg.sender] += shareAmount;
        if (investorShares[msg.sender] == shareAmount) {
            investors.push(msg.sender);
        }
        
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(msg.sender, tokenId);
        
        emit Investment(msg.sender, msg.value, shareAmount);
        
        // Return excess payment
        if (msg.value > sharePrice) {
            (bool success, ) = msg.sender.call{value: msg.value - sharePrice}("");
            require(success, "Refund failed");
        }
    }
    
    function updateValuation(uint256 newValuation) 
        external 
        onlyRole(VALUATION_ROLE) 
        whenNotPaused 
    {
        require(newValuation > 0, "Invalid valuation");
        emit ValuationUpdated(currentValuation, newValuation);
        currentValuation = newValuation;
    }
    
    function withdrawFunds(uint256 amount) 
        external 
        onlyRole(GOVERNANCE_ROLE) 
        whenNotPaused 
        nonReentrant 
    {
        require(address(this).balance >= amount, "Insufficient balance");
        (bool success, ) = startupOwner.call{value: amount}("");
        require(success, "Withdrawal failed");
        emit FundsWithdrawn(startupOwner, amount);
    }
    
    function distributeProfits() 
        external 
        payable 
        onlyRole(GOVERNANCE_ROLE) 
        whenNotPaused 
        nonReentrant 
    {
        require(msg.value > 0, "Must distribute some profits");
        uint256 totalDistributed = 0;
        
        for (uint256 i = 0; i < investors.length; i++) {
            address investor = investors[i];
            uint256 share = (msg.value * investorShares[investor]) / totalShares;
            if (share > 0) {
                (bool success, ) = investor.call{value: share}("");
                require(success, "Profit distribution failed");
                totalDistributed += share;
            }
        }
        
        emit ProfitsDistributed(totalDistributed);
    }
    
    // Override required functions
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) whenNotPaused {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
    
    // Emergency functions
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }
    
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
    
    receive() external payable {}
}