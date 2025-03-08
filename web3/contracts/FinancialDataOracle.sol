// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./chainlink-functions/dev/v1_0_0/FunctionsClient.sol";
import "./chainlink-functions/dev/v1_0_0/FunctionsRouter.sol";
import "./chainlink-functions/dev/v1_0_0/FunctionsRequest.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract FinancialDataOracle is FunctionsClient, Ownable, ReentrancyGuard {
    using FunctionsRequest for FunctionsRequest.Request;
    
    struct FinancialMetrics {
        uint256 startupId;
        uint256 revenue;
        uint256 userGrowth;
        uint256 marketSize;
        uint256 burnRate;
        uint256 timestamp;
    }
    
    mapping(uint256 => FinancialMetrics[]) public startupMetrics;
    mapping(bytes32 => uint256) private requestToStartupId;
    mapping(uint256 => uint256) private lastUpdateTime;

    uint256 public constant MIN_UPDATE_INTERVAL = 7 days;
    
    event MetricsRequested(bytes32 indexed requestId, uint256 indexed startupId);
    event MetricsReceived(
        uint256 indexed startupId,
        uint256 revenue,
        uint256 userGrowth,
        uint256 marketSize,
        uint256 burnRate
    );

    uint64 private s_subscriptionId;
    bytes32 private s_donId;
    uint32 private s_gasLimit;
    bytes private s_source;
    
    constructor(
        address router,
        uint64 subscriptionId,
        bytes32 donId,
        bytes memory source
    ) FunctionsClient(router) {
        if (router == address(0)) revert("Invalid router address");
        
        s_subscriptionId = subscriptionId;
        s_donId = donId;
        s_gasLimit = 300000;
        s_source = source;
    }
    
    function requestFinancialMetrics(uint256 startupId) external returns (bytes32) {
        require(block.timestamp >= lastUpdateTime[startupId] + MIN_UPDATE_INTERVAL, "Update too soon");
        
        string[] memory args = new string[](1);
        args[0] = toString(startupId);

        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(string(s_source));
        req.setArgs(args);

        bytes32 requestId = _sendRequest(
            req.encodeCBOR(),
            s_subscriptionId,
            s_gasLimit,
            s_donId
        );

        requestToStartupId[requestId] = startupId;
        lastUpdateTime[startupId] = block.timestamp;
        
        emit MetricsRequested(requestId, startupId);
        return requestId;
    }
    
    function fulfillRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory err
    ) internal override {
        if (err.length > 0) {
            return;
        }

        uint256 startupId = requestToStartupId[requestId];
        uint256[] memory metrics = abi.decode(response, (uint256[]));
        require(metrics.length == 4, "Invalid response length");
        
        FinancialMetrics memory data = FinancialMetrics({
            startupId: startupId,
            revenue: metrics[0],
            userGrowth: metrics[1],
            marketSize: metrics[2],
            burnRate: metrics[3],
            timestamp: block.timestamp
        });
        
        startupMetrics[startupId].push(data);
        emit MetricsReceived(
            startupId,
            metrics[0],
            metrics[1],
            metrics[2],
            metrics[3]
        );
    }
    
    function getLatestMetrics(uint256 startupId) external view returns (
        uint256 revenue,
        uint256 userGrowth,
        uint256 marketSize,
        uint256 burnRate,
        uint256 timestamp
    ) {
        require(startupMetrics[startupId].length > 0, "No metrics available");
        FinancialMetrics memory latest = startupMetrics[startupId][startupMetrics[startupId].length - 1];
        return (
            latest.revenue,
            latest.userGrowth,
            latest.marketSize,
            latest.burnRate,
            latest.timestamp
        );
    }
    
    function getHistoricalMetrics(uint256 startupId) external view returns (FinancialMetrics[] memory) {
        return startupMetrics[startupId];
    }
    
    function updateConfig(
        uint64 subscriptionId,
        bytes32 donId,
        uint32 gasLimit,
        bytes calldata source
    ) external onlyOwner {
        s_subscriptionId = subscriptionId;
        s_donId = donId;
        s_gasLimit = gasLimit;
        s_source = source;
    }

    function toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}