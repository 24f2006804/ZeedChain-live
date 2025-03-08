// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../chainlink-functions/dev/v1_0_0/interfaces/IFunctionsClient.sol";

contract MockFunctionsRouter is Ownable {
    struct Commitment {
        address client;
        bool used;
    }
    
    mapping(bytes32 => Commitment) private s_commitments;
    mapping(bytes32 => address) private s_requesters;
    uint256 private nonce;

    event RequestProcessed(bytes32 indexed requestId, bytes response, bytes err);
    
    constructor() {}

    function sendRequest(
        uint64 /* subscriptionId */,
        bytes calldata data,
        uint32 /* gasLimit */,
        bytes32 /* donId */
    ) external returns (bytes32) {
        // Generate request ID where first byte indicates request type:
        // - KYC: 0-127
        // - AML: 128-191
        // - Credentials: 192-255
        nonce++;
        uint8 requestType;
        
        // Use first few bytes of data hash to determine request type
        bytes32 dataHash = keccak256(data);
        uint8 seed = uint8(dataHash[0]);
        
        // Ensure even distribution across request types
        if (seed < 85) {
            requestType = 64; // Mid range for KYC (0-127)
        } else if (seed < 170) {
            requestType = 160; // Mid range for AML (128-191)
        } else {
            requestType = 224; // Mid range for Credentials (192-255)
        }
        
        // Combine request type with nonce and sender for uniqueness
        bytes32 requestId = bytes32(
            (uint256(requestType) << 248) | // Place type in first byte
            (uint256(uint160(msg.sender)) << 88) | // Then sender address
            (nonce) // Finally the nonce
        );
        
        s_commitments[requestId] = Commitment({
            client: msg.sender,
            used: false
        });
        s_requesters[requestId] = msg.sender;
        return requestId;
    }

    function fulfillRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory err
    ) external {
        Commitment storage commitment = s_commitments[requestId];
        require(commitment.client != address(0), "Request not found");
        require(!commitment.used, "Request already fulfilled");
        
        // Mark as used before calling fulfillment to prevent reentrancy
        commitment.used = true;
        
        // Emit event and call fulfillment
        IFunctionsClient(commitment.client).handleOracleFulfillment(requestId, response, err);
        emit RequestProcessed(requestId, response, err);

        // Clean up request data after successful fulfillment
        delete s_commitments[requestId];
        delete s_requesters[requestId];
    }

    function getRequestConfig() external pure returns (
        uint32 fulfillmentGasLimit,
        uint32 requestTimeoutSeconds
    ) {
        return (300000, 300);
    }
}