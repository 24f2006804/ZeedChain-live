// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

interface ILinkTokenInterface {
    function transfer(address to, uint256 value) external returns (bool success);
    function transferAndCall(address to, uint256 value, bytes calldata data) external returns (bool success);
    function balanceOf(address owner) external view returns (uint256);
}

contract MockOracle is Ownable {
    uint256 constant public EXPIRY_TIME = 5 minutes;
    ILinkTokenInterface public LINK;

    struct Request {
        address callbackAddr;
        bytes4 callbackFunctionId;
        uint256 expiration;
        bytes32 data;
    }

    mapping(bytes32 => Request) private commitments;

    event OracleRequest(
        bytes32 indexed specId,
        address requester,
        bytes32 requestId,
        uint256 payment,
        address callbackAddr,
        bytes4 callbackFunctionId,
        uint256 cancelExpiration,
        uint256 dataVersion,
        bytes data
    );

    constructor(address _link) {
        LINK = ILinkTokenInterface(_link);
    }

    function oracleRequest(
        address sender,
        uint256 payment,
        bytes32 specId,
        address callbackAddress,
        bytes4 callbackFunctionId,
        uint256 nonce,
        uint256 dataVersion,
        bytes calldata data
    ) external returns (bytes32 requestId) {
        requestId = keccak256(abi.encodePacked(sender, nonce));
        require(commitments[requestId].callbackAddr == address(0), "Must use a unique ID");
        
        commitments[requestId] = Request(
            callbackAddress,
            callbackFunctionId,
            block.timestamp + EXPIRY_TIME,
            keccak256(data)
        );

        emit OracleRequest(
            specId,
            sender,
            requestId,
            payment,
            callbackAddress,
            callbackFunctionId,
            block.timestamp + EXPIRY_TIME,
            dataVersion,
            data
        );

        return requestId;
    }

    function fulfillRequest(
        bytes32 requestId,
        uint256 payment,
        address callbackAddress,
        bytes4 callbackFunctionId,
        uint256 expiration,
        bytes32 data
    ) external returns (bool) {
        Request memory req = commitments[requestId];
        require(req.callbackAddr != address(0), "Request not found");
        require(req.expiration >= block.timestamp, "Request expired");
        
        delete commitments[requestId];
        (bool success,) = req.callbackAddr.call(abi.encodeWithSelector(req.callbackFunctionId, requestId, data));
        return success;
    }

    function fulfillOracleRequest2(
        bytes32 requestId,
        uint256 payment,
        address callbackAddress,
        bytes4 callbackFunctionId,
        uint256 expiration,
        bytes calldata data
    ) external returns (bool) {
        Request memory req = commitments[requestId];
        require(req.callbackAddr != address(0), "Request not found");
        require(req.expiration >= block.timestamp, "Request expired");
        
        delete commitments[requestId];
        (bool success,) = req.callbackAddr.call(abi.encodeWithSelector(req.callbackFunctionId, requestId, data));
        return success;
    }

    function withdraw(address recipient, uint256 amount) external onlyOwner {
        LINK.transfer(recipient, amount);
    }

    function withdrawable() external view returns (uint256) {
        return LINK.balanceOf(address(this));
    }

    function cancelOracleRequest(
        bytes32 requestId,
        uint256 payment,
        bytes4 callbackFunc,
        uint256 expiration
    ) external {
        require(commitments[requestId].callbackAddr != address(0), "Request not found");
        delete commitments[requestId];
    }
}