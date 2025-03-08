// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./FunctionsRouter.sol";
import "./interfaces/IFunctionsClient.sol";
import "../interfaces/FunctionsResponseTypes.sol";

abstract contract FunctionsClient is IFunctionsClient {
    FunctionsRouter internal immutable i_router;

    constructor(address router) {
        i_router = FunctionsRouter(router);
    }

    function handleOracleFulfillment(
        bytes32 requestId,
        bytes memory response,
        bytes memory err
    ) external override {
        require(msg.sender == address(i_router), "Only router can fulfill");
        fulfillRequest(requestId, response, err);
    }

    function _sendRequest(
        bytes memory data,
        uint64 subscriptionId,
        uint32 gasLimit,
        bytes32 donId
    ) internal returns (bytes32) {
        return i_router.sendRequest(
            subscriptionId,
            data,
            gasLimit,
            donId
        );
    }

    function fulfillRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory err
    ) internal virtual;
}