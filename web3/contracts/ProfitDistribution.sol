// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "./FractionalInvestment.sol";
import "./EquityNFTFactory.sol";

contract ProfitDistribution is ReentrancyGuard {
    using EnumerableSet for EnumerableSet.UintSet;

    FractionalInvestment public immutable fractionalInvestment;

    struct Distribution {
        uint256 totalAmount;
        uint256 remainingAmount;
        uint256 timestamp;
        mapping(address => bool) claimed;
    }

    mapping(uint256 => Distribution[]) public distributions;
    mapping(uint256 => uint256) public lastDistributionIndex;

    event ProfitDistributed(uint256 indexed startupId, uint256 amount, uint256 distributionIndex);
    event ProfitClaimed(uint256 indexed startupId, address indexed investor, uint256 amount, uint256 distributionIndex);

    constructor(address payable _fractionalInvestment) {
        fractionalInvestment = FractionalInvestment(_fractionalInvestment);
    }

    function distributeProfit(uint256 startupId) external payable nonReentrant {
        require(msg.value > 0, "No profit to distribute");
        
        uint256 distributionIndex = distributions[startupId].length;
        Distribution storage newDistribution = distributions[startupId].push();
        newDistribution.totalAmount = msg.value;
        newDistribution.remainingAmount = msg.value;
        newDistribution.timestamp = block.timestamp;

        lastDistributionIndex[startupId] = distributionIndex;
        emit ProfitDistributed(startupId, msg.value, distributionIndex);
    }

    function claimProfit(uint256 startupId, uint256 distributionIndex) external nonReentrant {
        require(distributionIndex < distributions[startupId].length, "Invalid distribution index");
        Distribution storage distribution = distributions[startupId][distributionIndex];
        
        require(!distribution.claimed[msg.sender], "Already claimed");
        require(distribution.remainingAmount > 0, "No remaining profit");

        uint256 shares = fractionalInvestment.getInvestorShares(startupId, msg.sender);
        require(shares > 0, "No shares owned");

        // Get total shares from startup details
        EquityNFTFactory.Startup memory startup = fractionalInvestment.equityFactory().getStartupDetails(startupId);
        uint256 totalShares = startup.totalShares;

        uint256 amount = (distribution.totalAmount * shares) / totalShares;
        require(amount <= distribution.remainingAmount, "Insufficient remaining amount");
        
        distribution.claimed[msg.sender] = true;
        distribution.remainingAmount -= amount;

        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");

        emit ProfitClaimed(startupId, msg.sender, amount, distributionIndex);
    }

    function getUnclaimedDistributions(uint256 startupId, address investor) external view returns (uint256[] memory) {
        uint256[] memory unclaimedIndices = new uint256[](distributions[startupId].length);
        uint256 count = 0;

        for (uint256 i = 0; i < distributions[startupId].length; i++) {
            if (!distributions[startupId][i].claimed[investor] && 
                fractionalInvestment.getInvestorShares(startupId, investor) > 0) {
                unclaimedIndices[count] = i;
                count++;
            }
        }

        // Resize array to actual count
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = unclaimedIndices[i];
        }
        return result;
    }

    receive() external payable {
        // Accept direct ETH transfers
    }
}