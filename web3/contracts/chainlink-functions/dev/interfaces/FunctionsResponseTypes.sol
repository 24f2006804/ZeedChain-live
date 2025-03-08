// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library FunctionsResponse {
    enum Status {
        NONE,
        PENDING,
        FULFILLED,
        ERROR
    }

    struct Commitment {
        bytes data;
        bytes error;
        Status status;
    }

    function encode(string memory data) internal pure returns (bytes memory) {
        return abi.encode(data);
    }

    function encodeUint(uint256 data) internal pure returns (bytes memory) {
        return abi.encode(data);
    }

    function encodeBool(bool data) internal pure returns (bytes memory) {
        return abi.encode(data);
    }

    function encodeBytes(bytes memory data) internal pure returns (bytes memory) {
        return data;
    }
}