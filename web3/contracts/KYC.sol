// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract KYC is Ownable, ReentrancyGuard {
    struct KYCData {
        string founderName;
        string aadharNumber;
        string panNumber;
        string ipfsDocumentsHash;
        uint256 timestamp;
        bool isVerified;
    }

    mapping(address => KYCData) public kycRecords;
    mapping(address => bool) public hasCompletedKYC;
    mapping(string => bool) public usedAadharNumbers;
    mapping(string => bool) public usedPanNumbers;

    event KYCCompleted(address indexed wallet, string founderName, uint256 timestamp);
    event KYCVerified(address indexed wallet, uint256 timestamp);

    modifier notKYCed() {
        require(!hasCompletedKYC[msg.sender], "KYC already completed");
        _;
    }

    modifier uniqueIdentifiers(string memory aadharNumber, string memory panNumber) {
        require(!usedAadharNumbers[aadharNumber], "Aadhar number already used");
        require(!usedPanNumbers[panNumber], "PAN number already used");
        _;
    }

    function completeKYC(
        string memory founderName,
        string memory aadharNumber,
        string memory panNumber,
        string memory ipfsDocumentsHash
    ) external notKYCed uniqueIdentifiers(aadharNumber, panNumber) nonReentrant {
        require(bytes(founderName).length > 0, "Invalid founder name");
        require(bytes(aadharNumber).length == 12, "Invalid Aadhar number");
        require(bytes(panNumber).length == 10, "Invalid PAN number");
        require(bytes(ipfsDocumentsHash).length > 0, "Invalid IPFS hash");

        kycRecords[msg.sender] = KYCData({
            founderName: founderName,
            aadharNumber: aadharNumber,
            panNumber: panNumber,
            ipfsDocumentsHash: ipfsDocumentsHash,
            timestamp: block.timestamp,
            isVerified: false
        });

        usedAadharNumbers[aadharNumber] = true;
        usedPanNumbers[panNumber] = true;
        hasCompletedKYC[msg.sender] = true;

        emit KYCCompleted(msg.sender, founderName, block.timestamp);
    }

    function verifyKYC(address wallet) external onlyOwner {
        require(hasCompletedKYC[wallet], "No KYC record found");
        require(!kycRecords[wallet].isVerified, "KYC already verified");

        kycRecords[wallet].isVerified = true;
        emit KYCVerified(wallet, block.timestamp);
    }

    function getKYCData(address wallet) external view returns (
        string memory founderName,
        string memory aadharNumber,
        string memory panNumber,
        string memory ipfsDocumentsHash,
        uint256 timestamp,
        bool isVerified
    ) {
        require(hasCompletedKYC[wallet], "No KYC record found");
        KYCData memory data = kycRecords[wallet];
        return (
            data.founderName,
            data.aadharNumber,
            data.panNumber,
            data.ipfsDocumentsHash,
            data.timestamp,
            data.isVerified
        );
    }
}