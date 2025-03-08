// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./EquityNFTFactory.sol";

contract DynamicValuation is Ownable, ReentrancyGuard, Pausable {
    EquityNFTFactory public immutable equityFactory;
    
    // Packed storage variables for gas optimization
    struct FeedData {
        address feedAddress;
        uint32 lastUpdateTime;
        uint8 decimals;
        bool isActive;
    }
    
    mapping(uint256 => FeedData) public startupFeeds;
    uint256 public constant UPDATE_INTERVAL = 1 days;
    uint256 public constant GRACE_PERIOD = 1 hours;
    int256 public constant THRESHOLD_PERCENTAGE = 30; // 30% max change
    
    event ValuationUpdated(uint256 indexed startupId, uint256 newValuation);
    event PriceFeedSet(uint256 indexed startupId, address feedAddress);
    event StalePriceDetected(uint256 indexed startupId, uint256 timestamp);
    
    error PriceFeedNotSet(uint256 startupId);
    error InvalidPrice(uint256 startupId);
    error UpdateTooSoon(uint256 startupId, uint256 nextValidUpdate);
    error StalePriceData(uint256 startupId, uint256 timestamp);
    error ExcessiveValuationChange(uint256 startupId, int256 changePercentage);
    
    constructor(address _equityFactory) Ownable() {
        equityFactory = EquityNFTFactory(_equityFactory);
    }
    
    function setPriceFeed(
        uint256 startupId, 
        address priceFeed
    ) external onlyOwner whenNotPaused {
        if(priceFeed == address(0)) revert InvalidPrice(startupId);
        
        AggregatorV3Interface feed = AggregatorV3Interface(priceFeed);
        startupFeeds[startupId] = FeedData({
            feedAddress: priceFeed,
            lastUpdateTime: uint32(block.timestamp),
            decimals: uint8(feed.decimals()),
            isActive: true
        });
        
        emit PriceFeedSet(startupId, priceFeed);
    }
    
    function updateValuation(
        uint256 startupId
    ) external nonReentrant whenNotPaused {
        FeedData storage feedData = startupFeeds[startupId];
        if (!feedData.isActive) revert PriceFeedNotSet(startupId);
        
        uint256 nextValidUpdate = uint256(feedData.lastUpdateTime) + UPDATE_INTERVAL;
        if (block.timestamp < nextValidUpdate) {
            revert UpdateTooSoon(startupId, nextValidUpdate);
        }
        
        AggregatorV3Interface feed = AggregatorV3Interface(feedData.feedAddress);
        (
            uint80 roundId,
            int256 price,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        ) = feed.latestRoundData();
        
        // Validate oracle data
        if (price <= 0) revert InvalidPrice(startupId);
        if (updatedAt == 0 || updatedAt < block.timestamp - GRACE_PERIOD) {
            emit StalePriceDetected(startupId, updatedAt);
            revert StalePriceData(startupId, updatedAt);
        }
        if (answeredInRound < roundId) revert StalePriceData(startupId, updatedAt);
        
        // Get current valuation and check for excessive changes
        uint256 currentValuation = equityFactory.getStartupValuation(startupId);
        if (currentValuation > 0) {
            int256 changePercentage = ((int256(uint256(price)) - int256(currentValuation)) * 100) / int256(currentValuation);
            if (abs(changePercentage) > THRESHOLD_PERCENTAGE) {
                revert ExcessiveValuationChange(startupId, changePercentage);
            }
        }
        
        uint256 newValuation = uint256(price);
        equityFactory.updateValuation(startupId, newValuation);
        feedData.lastUpdateTime = uint32(block.timestamp);
        
        emit ValuationUpdated(startupId, newValuation);
    }
    
    function getLatestValuation(
        uint256 startupId
    ) external view returns (uint256) {
        FeedData storage feedData = startupFeeds[startupId];
        if (!feedData.isActive) revert PriceFeedNotSet(startupId);
        
        AggregatorV3Interface feed = AggregatorV3Interface(feedData.feedAddress);
        (
            uint80 roundId,
            int256 price,
            ,
            uint256 updatedAt,
            uint80 answeredInRound
        ) = feed.latestRoundData();
        
        if (price <= 0) revert InvalidPrice(startupId);
        if (updatedAt < block.timestamp - GRACE_PERIOD) revert StalePriceData(startupId, updatedAt);
        if (answeredInRound < roundId) revert StalePriceData(startupId, updatedAt);
        
        return uint256(price);
    }
    
    function abs(int256 x) internal pure returns (int256) {
        return x >= 0 ? x : -x;
    }
    
    // Emergency controls
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    function setFeedStatus(uint256 startupId, bool active) external onlyOwner {
        FeedData storage feedData = startupFeeds[startupId];
        if(feedData.feedAddress == address(0)) revert PriceFeedNotSet(startupId);
        feedData.isActive = active;
    }
}