// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./chainlink-functions/dev/v1_0_0/FunctionsClient.sol";
import "./chainlink-functions/dev/v1_0_0/FunctionsRouter.sol";
import "./chainlink-functions/dev/v1_0_0/FunctionsRequest.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract VerificationOracle is FunctionsClient, Ownable, ReentrancyGuard {
    using FunctionsRequest for FunctionsRequest.Request;

    struct VerificationData {
        bool kycPassed;
        bool amlPassed;
        string credentialHash;
        string verificationSource;
        uint256 timestamp;
        bool isValid;
        bytes32 lastRequestId;
    }
    
    mapping(address => VerificationData) public userVerifications;
    mapping(bytes32 => address) private requestToUser;
    mapping(bytes32 => uint8) private requestTypes; // Track request types
    
    // Request type constants
    uint8 private constant KYC_REQUEST = 64;
    uint8 private constant AML_REQUEST = 160;
    uint8 private constant CREDENTIALS_REQUEST = 224;
    
    event VerificationRequested(bytes32 indexed requestId, address indexed user);
    event VerificationCompleted(
        address indexed user,
        bool kycPassed,
        bool amlPassed,
        string credentialHash,
        string verificationSource
    );
    event RequestFailed(bytes32 indexed requestId, bytes reason);
    
    uint64 private s_subscriptionId;
    bytes32 private s_donId;
    uint32 private s_gasLimit;
    bytes private s_kycSource;
    bytes private s_amlSource;
    bytes private s_credentialsSource;

    constructor(
        address router,
        uint64 subscriptionId,
        bytes32 donId,
        bytes memory kycSource,
        bytes memory amlSource,
        bytes memory credentialsSource
    ) FunctionsClient(router) {
        if (router == address(0)) revert("Invalid router address");
        
        s_subscriptionId = subscriptionId;
        s_donId = donId;
        s_gasLimit = 300000;
        s_kycSource = kycSource;
        s_amlSource = amlSource;
        s_credentialsSource = credentialsSource;
    }
    
    function requestVerification(
        address user,
        string calldata documentHash
    ) external returns (bytes32) {
        // Clean up old request if it exists
        bytes32 oldRequestId = userVerifications[user].lastRequestId;
        if (oldRequestId != bytes32(0)) {
            delete requestToUser[oldRequestId];
            delete requestTypes[oldRequestId];
        }

        string[] memory args = new string[](2);
        args[0] = addressToString(user);
        args[1] = documentHash;

        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(string(s_kycSource));
        req.setArgs(args);

        bytes32 requestId = _sendRequest(
            req.encodeCBOR(),
            s_subscriptionId,
            s_gasLimit,
            s_donId
        );

        requestToUser[requestId] = user;
        requestTypes[requestId] = KYC_REQUEST;
        userVerifications[user].lastRequestId = requestId;
        emit VerificationRequested(requestId, user);
        
        return requestId;
    }
    
    function fulfillRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory err
    ) internal override {
        address user = requestToUser[requestId];
        require(user != address(0), "Unknown request");

        // Get the request type
        uint8 requestType = requestTypes[requestId];

        // Clean up request mappings
        delete requestToUser[requestId];
        delete requestTypes[requestId];

        if (err.length > 0) {
            emit RequestFailed(requestId, err);
            if (requestType == KYC_REQUEST) {
                finalizeVerification(user, false, false, "", "KYC Failed");
            } else if (requestType == AML_REQUEST) {
                finalizeVerification(user, userVerifications[user].kycPassed, false, "", "AML Check Failed");
            } else {
                finalizeVerification(user, userVerifications[user].kycPassed, userVerifications[user].amlPassed, "", "Credentials Failed");
            }
            return;
        }
        
        // Check if this is a KYC response
        if (requestType == KYC_REQUEST) {
            bool kycPassed;
            // Try to decode the response, if it fails assume false
            try this.decodeResponse(response) returns (bool result) {
                kycPassed = result;
            } catch {
                kycPassed = false;
            }
            
            if (kycPassed) {
                userVerifications[user].kycPassed = true;
                requestAMLCheck(user);
            } else {
                finalizeVerification(user, false, false, "", "KYC Failed");
            }
        }
        // Check if this is an AML response
        else if (requestType == AML_REQUEST) {
            bool amlPassed;
            // Try to decode the response, if it fails assume false
            try this.decodeResponse(response) returns (bool result) {
                amlPassed = result;
            } catch {
                amlPassed = false;
            }
            
            userVerifications[user].amlPassed = amlPassed;
            
            if (amlPassed && userVerifications[user].kycPassed) {
                requestCredentialsValidation(user);
            } else {
                finalizeVerification(user, userVerifications[user].kycPassed, amlPassed, "", "AML Check Failed");
            }
        }
        // Must be a credentials response
        else {
            try this.decodeCredentialsResponse(response) returns (string memory hash, string memory source) {
                finalizeVerification(
                    user,
                    userVerifications[user].kycPassed,
                    userVerifications[user].amlPassed,
                    hash,
                    source
                );
            } catch {
                finalizeVerification(
                    user,
                    userVerifications[user].kycPassed,
                    userVerifications[user].amlPassed,
                    "",
                    "Credentials Failed"
                );
            }
        }
    }

    // Helper functions for decoding responses externally to allow try/catch
    function decodeResponse(bytes memory response) external pure returns (bool) {
        return abi.decode(response, (bool));
    }

    function decodeCredentialsResponse(bytes memory response) external pure returns (string memory, string memory) {
        return abi.decode(response, (string, string));
    }

    function requestAMLCheck(address user) internal {
        // Clean up old request if it exists
        bytes32 oldRequestId = userVerifications[user].lastRequestId;
        if (oldRequestId != bytes32(0)) {
            delete requestToUser[oldRequestId];
            delete requestTypes[oldRequestId];
        }

        string[] memory args = new string[](1);
        args[0] = addressToString(user);

        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(string(s_amlSource));
        req.setArgs(args);

        bytes32 requestId = _sendRequest(
            req.encodeCBOR(),
            s_subscriptionId,
            s_gasLimit,
            s_donId
        );

        requestToUser[requestId] = user;
        requestTypes[requestId] = AML_REQUEST;
        userVerifications[user].lastRequestId = requestId;
        emit VerificationRequested(requestId, user);
    }

    function requestCredentialsValidation(address user) internal {
        // Clean up old request if it exists
        bytes32 oldRequestId = userVerifications[user].lastRequestId;
        if (oldRequestId != bytes32(0)) {
            delete requestToUser[oldRequestId];
            delete requestTypes[oldRequestId];
        }

        string[] memory args = new string[](1);
        args[0] = addressToString(user);

        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(string(s_credentialsSource));
        req.setArgs(args);

        bytes32 requestId = _sendRequest(
            req.encodeCBOR(),
            s_subscriptionId,
            s_gasLimit,
            s_donId
        );

        requestToUser[requestId] = user;
        requestTypes[requestId] = CREDENTIALS_REQUEST;
        userVerifications[user].lastRequestId = requestId;
        emit VerificationRequested(requestId, user);
    }
    
    function finalizeVerification(
        address user,
        bool kycPassed,
        bool amlPassed,
        string memory credentialHash,
        string memory source
    ) internal {
        VerificationData storage data = userVerifications[user];
        data.kycPassed = kycPassed;
        data.amlPassed = amlPassed;
        data.credentialHash = credentialHash;
        data.verificationSource = source;
        data.timestamp = block.timestamp;
        data.isValid = true;
        
        emit VerificationCompleted(
            user,
            kycPassed,
            amlPassed,
            credentialHash,
            source
        );
    }
    
    function getVerificationStatus(address user) external view returns (
        bool kycPassed,
        bool amlPassed,
        string memory credentialHash,
        string memory verificationSource,
        uint256 timestamp,
        bool isValid
    ) {
        VerificationData memory data = userVerifications[user];
        return (
            data.kycPassed,
            data.amlPassed,
            data.credentialHash,
            data.verificationSource,
            data.timestamp,
            data.isValid
        );
    }
    
    function updateConfig(
        uint64 subscriptionId,
        bytes32 donId,
        uint32 gasLimit,
        bytes calldata kycSource,
        bytes calldata amlSource,
        bytes calldata credentialsSource
    ) external onlyOwner {
        s_subscriptionId = subscriptionId;
        s_donId = donId;
        s_gasLimit = gasLimit;
        s_kycSource = kycSource;
        s_amlSource = amlSource;
        s_credentialsSource = credentialsSource;
    }

    function addressToString(address _address) internal pure returns(string memory) {
        bytes32 value = bytes32(uint256(uint160(_address)));
        bytes memory alphabet = "0123456789abcdef";

        bytes memory str = new bytes(42);
        str[0] = "0";
        str[1] = "x";
        for (uint256 i = 0; i < 20; i++) {
            str[2+i*2] = alphabet[uint8(value[i + 12] >> 4)];
            str[3+i*2] = alphabet[uint8(value[i + 12] & 0x0f)];
        }
        return string(str);
    }
}