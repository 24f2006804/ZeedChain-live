// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./chainlink-functions/dev/v1_0_0/FunctionsClient.sol";
import "./chainlink-functions/dev/v1_0_0/FunctionsRouter.sol";
import "./chainlink-functions/dev/v1_0_0/FunctionsRequest.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AIAdvisorIntegration is FunctionsClient, Ownable, ReentrancyGuard {
    using FunctionsRequest for FunctionsRequest.Request;

    struct AIAdvice {
        uint256 startupId;
        uint256 confidenceScore;
        string recommendation;
        uint256 timestamp;
        bool isValid;
    }
    
    mapping(uint256 => AIAdvice[]) public startupAdvice;
    mapping(bytes32 => uint256) private requestToStartupId;
    
    event AdviceRequested(bytes32 indexed requestId, uint256 indexed startupId);
    event AdviceReceived(uint256 indexed startupId, string recommendation, uint256 confidenceScore);
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
    }

    function requestAIAdvice(uint256 startupId) external nonReentrant returns (bytes32) {
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
        emit AdviceRequested(requestId, startupId);
        
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

        uint256 startupId = requestToStartupId[requestId];
        
        // Decode the response which should be ABI encoded (recommendation, confidenceScore)
        (string memory recommendation, uint256 confidenceScore) = abi.decode(response, (string, uint256));
        
        AIAdvice memory newAdvice = AIAdvice({
            startupId: startupId,
            confidenceScore: confidenceScore,
            recommendation: recommendation,
            timestamp: block.timestamp,
            isValid: true
        });
        
        startupAdvice[startupId].push(newAdvice);
        emit AdviceReceived(startupId, recommendation, confidenceScore);
    }

    function getLatestAdvice(uint256 startupId) external view returns (
        string memory recommendation,
        uint256 confidenceScore,
        uint256 timestamp
    ) {
        require(startupAdvice[startupId].length > 0, "No advice available");
        AIAdvice memory latest = startupAdvice[startupId][startupAdvice[startupId].length - 1];
        return (latest.recommendation, latest.confidenceScore, latest.timestamp);
    }
    
    function getAllAdvice(uint256 startupId) external view returns (AIAdvice[] memory) {
        return startupAdvice[startupId];
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