// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "./EquityNFTFactory.sol";

contract StartupValidation is Ownable {
    using EnumerableSet for EnumerableSet.AddressSet;

    EquityNFTFactory public immutable equityFactory;

    struct ValidationRequest {
        uint256 startupId;
        address founder;
        uint256 requestTimestamp;
        ValidationStatus status;
        string documentHash;
        mapping(address => bool) validatorVotes;
        uint256 approvalCount;
        uint256 rejectionCount;
        string rejectionReason;
    }

    enum ValidationStatus {
        Pending,
        Approved,
        Rejected
    }

    struct ValidatorInfo {
        string name;
        string credentials;
        uint256 validationCount;
        bool isActive;
    }

    mapping(uint256 => ValidationRequest) public validationRequests;
    mapping(address => ValidatorInfo) public validators;
    EnumerableSet.AddressSet private validatorSet;

    uint256 public constant MINIMUM_VALIDATORS = 3;
    uint256 public validationThreshold;

    event ValidationRequested(uint256 indexed startupId, address indexed founder, string documentHash);
    event ValidatorVoted(uint256 indexed startupId, address indexed validator, bool approved);
    event ValidationCompleted(uint256 indexed startupId, ValidationStatus status);
    event ValidatorAdded(address indexed validator, string name);
    event ValidatorRemoved(address indexed validator);

    constructor(address _equityFactory, uint256 _validationThreshold) Ownable() {
        equityFactory = EquityNFTFactory(_equityFactory);
        validationThreshold = _validationThreshold;
    }

    function requestValidation(uint256 startupId, string calldata documentHash) external {
        require(msg.sender == equityFactory.getStartupDetails(startupId).founder, "Not startup founder");
        
        ValidationRequest storage request = validationRequests[startupId];
        require(request.requestTimestamp == 0, "Validation already requested");

        request.startupId = startupId;
        request.founder = msg.sender;
        request.requestTimestamp = block.timestamp;
        request.status = ValidationStatus.Pending;
        request.documentHash = documentHash;

        emit ValidationRequested(startupId, msg.sender, documentHash);
    }

    function submitValidatorVote(uint256 startupId, bool approved, string calldata rejectionReason) external {
        require(validators[msg.sender].isActive, "Not an active validator");
        ValidationRequest storage request = validationRequests[startupId];
        require(request.requestTimestamp > 0, "Validation not requested");
        require(request.status == ValidationStatus.Pending, "Validation already completed");
        require(!request.validatorVotes[msg.sender], "Already voted");

        request.validatorVotes[msg.sender] = true;
        if (approved) {
            request.approvalCount++;
        } else {
            request.rejectionCount++;
            if (bytes(rejectionReason).length > 0) {
                request.rejectionReason = rejectionReason;
            }
        }

        emit ValidatorVoted(startupId, msg.sender, approved);

        // Check if validation is complete
        if (request.approvalCount >= validationThreshold) {
            request.status = ValidationStatus.Approved;
            equityFactory.validateStartup(startupId, true);
            emit ValidationCompleted(startupId, ValidationStatus.Approved);
        } else if (request.rejectionCount > validatorSet.length() - validationThreshold) {
            request.status = ValidationStatus.Rejected;
            equityFactory.validateStartup(startupId, false);
            emit ValidationCompleted(startupId, ValidationStatus.Rejected);
        }
    }

    function addValidator(address validator, string calldata name, string calldata credentials) external onlyOwner {
        require(!validators[validator].isActive, "Validator already exists");
        validators[validator] = ValidatorInfo({
            name: name,
            credentials: credentials,
            validationCount: 0,
            isActive: true
        });
        validatorSet.add(validator);
        emit ValidatorAdded(validator, name);
    }

    function removeValidator(address validator) external onlyOwner {
        require(validators[validator].isActive, "Validator not active");
        validators[validator].isActive = false;
        validatorSet.remove(validator);
        emit ValidatorRemoved(validator);
    }

    function updateValidationThreshold(uint256 newThreshold) external onlyOwner {
        require(newThreshold <= validatorSet.length(), "Threshold too high");
        require(newThreshold >= MINIMUM_VALIDATORS, "Threshold too low");
        validationThreshold = newThreshold;
    }

    function getValidationStatus(uint256 startupId) external view returns (
        ValidationStatus status,
        uint256 approvalCount,
        uint256 rejectionCount,
        string memory rejectionReason
    ) {
        ValidationRequest storage request = validationRequests[startupId];
        return (
            request.status,
            request.approvalCount,
            request.rejectionCount,
            request.rejectionReason
        );
    }

    function getValidatorCount() external view returns (uint256) {
        return validatorSet.length();
    }

    function getValidatorList() external view returns (address[] memory) {
        uint256 length = validatorSet.length();
        address[] memory validators_ = new address[](length);
        for (uint256 i = 0; i < length; i++) {
            validators_[i] = validatorSet.at(i);
        }
        return validators_;
    }
}