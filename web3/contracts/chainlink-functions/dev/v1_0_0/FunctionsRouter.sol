// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IFunctionsClient.sol";
import "../interfaces/FunctionsResponseTypes.sol";

contract FunctionsRouter {
    using FunctionsResponse for FunctionsResponse.Commitment;

    mapping(bytes32 => FunctionsResponse.Commitment) private s_commitments;
    mapping(bytes32 => address) private s_requesters;

    event RequestProcessed(bytes32 indexed id, bytes response, bytes err);
    event RequestSent(bytes32 indexed id, address indexed requester);

    function sendRequest(
        uint64 subscriptionId,
        bytes calldata data,
        uint32 gasLimit,
        bytes32 donId
    ) external returns (bytes32) {
        bytes32 requestId = keccak256(abi.encodePacked(block.timestamp, msg.sender, subscriptionId));
        s_requesters[requestId] = msg.sender;
        s_commitments[requestId] = FunctionsResponse.Commitment({
            data: data,
            error: new bytes(0),
            status: FunctionsResponse.Status.PENDING
        });

        emit RequestSent(requestId, msg.sender);
        return requestId;
    }

    function fulfill(
        bytes32 requestId,
        bytes memory response,
        bytes memory err
    ) external {
        address requester = s_requesters[requestId];
        require(requester != address(0), "Request not found");

        FunctionsResponse.Commitment storage commitment = s_commitments[requestId];
        require(commitment.status == FunctionsResponse.Status.PENDING, "Request already fulfilled");

        if (err.length > 0) {
            commitment.status = FunctionsResponse.Status.ERROR;
            commitment.error = err;
        } else {
            commitment.status = FunctionsResponse.Status.FULFILLED;
            commitment.data = response;
        }

        IFunctionsClient(requester).handleOracleFulfillment(requestId, response, err);
        emit RequestProcessed(requestId, response, err);
    }

    function getRequestConfig() external pure returns (
        uint32 fulfillmentGasLimit,
        uint32 requestTimeoutSeconds
    ) {
        return (300000, 300);
    }

    function getCommitment(bytes32 requestId) external view returns (
        bytes memory data,
        bytes memory error,
        FunctionsResponse.Status status
    ) {
        FunctionsResponse.Commitment memory commitment = s_commitments[requestId];
        return (commitment.data, commitment.error, commitment.status);
    }
}