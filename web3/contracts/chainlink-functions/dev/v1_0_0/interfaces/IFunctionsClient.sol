// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IFunctionsClient {
    function handleOracleFulfillment(
        bytes32 requestId,
        bytes memory response,
        bytes memory err
    ) external;
}