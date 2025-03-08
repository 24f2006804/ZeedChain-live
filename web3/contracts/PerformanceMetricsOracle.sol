// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./chainlink-functions/dev/v1_0_0/FunctionsClient.sol";
import "./chainlink-functions/dev/v1_0_0/FunctionsRouter.sol";
import "./chainlink-functions/dev/v1_0_0/FunctionsRequest.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract PerformanceMetricsOracle is FunctionsClient, AccessControl, ReentrancyGuard, Pausable {
    using FunctionsRequest for FunctionsRequest.Request;
    
    bytes32 public constant METRICS_PROVIDER_ROLE = keccak256("METRICS_PROVIDER_ROLE");
    bytes32 public constant VALIDATOR_ROLE = keccak256("VALIDATOR_ROLE");
    
    struct PerformanceData {
        uint256 activeUsers;
        uint256 monthlyRevenue;
        uint256 customerGrowth;
        uint256 retentionRate;
        uint256 unitEconomics;
        uint256 timestamp;
        bool isValidated;
    }
    
    struct MetricsRequest {
        uint256 startupId;
        uint256 timestamp;
        string dataSource;
        bool isPending;
    }
    
    mapping(uint256 => PerformanceData[]) public startupPerformance;
    mapping(bytes32 => MetricsRequest) public pendingRequests;
    mapping(uint256 => uint256) public lastUpdateTime;
    
    uint256 public constant MIN_UPDATE_INTERVAL = 7 days;
    
    event MetricsRequested(bytes32 indexed requestId, uint256 indexed startupId);
    event MetricsReceived(
        uint256 indexed startupId,
        uint256 activeUsers,
        uint256 monthlyRevenue,
        uint256 customerGrowth,
        uint256 retentionRate,
        uint256 unitEconomics
    );
    event MetricsValidated(uint256 indexed startupId, uint256 timestamp);
    event RequestFailed(bytes32 indexed requestId, bytes reason);
    
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
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
    
    function requestPerformanceMetrics(
        uint256 startupId,
        string calldata dataSource
    ) external whenNotPaused onlyRole(METRICS_PROVIDER_ROLE) returns (bytes32) {
        require(
            block.timestamp >= lastUpdateTime[startupId] + MIN_UPDATE_INTERVAL,
            "Update too soon"
        );
        
        string[] memory args = new string[](2);
        args[0] = toString(startupId);
        args[1] = dataSource;
        
        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(string(s_source));
        req.setArgs(args);
        
        bytes32 requestId = _sendRequest(
            req.encodeCBOR(),
            s_subscriptionId,
            s_gasLimit,
            s_donId
        );
        
        pendingRequests[requestId] = MetricsRequest({
            startupId: startupId,
            timestamp: block.timestamp,
            dataSource: dataSource,
            isPending: true
        });
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
            emit RequestFailed(requestId, err);
            return;
        }

        MetricsRequest memory request = pendingRequests[requestId];
        require(request.isPending, "Request not found or already processed");
        
        uint256[] memory metrics = abi.decode(response, (uint256[]));
        require(metrics.length == 5, "Invalid response length");
        
        PerformanceData memory data = PerformanceData({
            activeUsers: metrics[0],
            monthlyRevenue: metrics[1],
            customerGrowth: metrics[2],
            retentionRate: metrics[3],
            unitEconomics: metrics[4],
            timestamp: request.timestamp,
            isValidated: false
        });
        
        startupPerformance[request.startupId].push(data);
        lastUpdateTime[request.startupId] = block.timestamp;
        delete pendingRequests[requestId];
        
        emit MetricsReceived(
            request.startupId,
            metrics[0],
            metrics[1],
            metrics[2],
            metrics[3],
            metrics[4]
        );
    }
    
    function validateMetrics(uint256 startupId, uint256 timestamp) external onlyRole(VALIDATOR_ROLE) {
        PerformanceData[] storage metrics = startupPerformance[startupId];
        for (uint256 i = 0; i < metrics.length; i++) {
            if (metrics[i].timestamp == timestamp && !metrics[i].isValidated) {
                metrics[i].isValidated = true;
                emit MetricsValidated(startupId, timestamp);
                break;
            }
        }
    }
    
    function getLatestMetrics(uint256 startupId) external view returns (
        uint256 activeUsers,
        uint256 monthlyRevenue,
        uint256 customerGrowth,
        uint256 retentionRate,
        uint256 unitEconomics,
        uint256 timestamp,
        bool isValidated
    ) {
        require(startupPerformance[startupId].length > 0, "No metrics available");
        PerformanceData memory latest = startupPerformance[startupId][startupPerformance[startupId].length - 1];
        return (
            latest.activeUsers,
            latest.monthlyRevenue,
            latest.customerGrowth,
            latest.retentionRate,
            latest.unitEconomics,
            latest.timestamp,
            latest.isValidated
        );
    }
    
    function getHistoricalMetrics(uint256 startupId) external view returns (PerformanceData[] memory) {
        return startupPerformance[startupId];
    }
    
    function updateConfig(
        uint64 subscriptionId,
        bytes32 donId,
        uint32 gasLimit,
        bytes calldata source
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
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
    
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }
    
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
}