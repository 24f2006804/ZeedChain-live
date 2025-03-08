// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./KYC.sol";

contract Startup is Ownable, ReentrancyGuard {
    KYC public kycContract;
    
    struct Financials {
        uint256 arr;
        uint256 mrr;
        uint8 cogs;
        uint8 marketing;
        uint8 cac;
        uint8 logistics;
        uint8 grossMargin;
        uint8 ebitda;
        uint8 salaries;
        uint8 misc;
        uint8 pat;
    }

    struct StartupInfo {
        string name;
        string industry;
        string fundingStage;
        string details;
        Financials financials;
        uint256 registrationTime;
        bool isActive;
    }

    mapping(address => StartupInfo) public startups;
    mapping(address => bool) public hasRegisteredStartup;

    event StartupRegistered(
        address indexed wallet,
        string name,
        string industry,
        uint256 timestamp
    );
    event StartupUpdated(
        address indexed wallet,
        string name,
        uint256 timestamp
    );

    constructor(address _kycContract) {
        kycContract = KYC(_kycContract);
    }

    modifier onlyKYCVerified() {
        require(kycContract.hasCompletedKYC(msg.sender), "Complete KYC first");
        (,,,,, bool isVerified) = kycContract.getKYCData(msg.sender);
        require(isVerified, "KYC not yet verified");
        _;
    }

    modifier noExistingStartup() {
        require(!hasRegisteredStartup[msg.sender], "Startup already registered");
        _;
    }

    function registerStartup(
        string memory name,
        string memory industry,
        string memory fundingStage,
        string memory details,
        uint256 arr,
        uint256 mrr,
        uint8 cogs,
        uint8 marketing,
        uint8 cac,
        uint8 logistics,
        uint8 grossMargin,
        uint8 ebitda,
        uint8 salaries,
        uint8 misc,
        uint8 pat
    ) external onlyKYCVerified noExistingStartup nonReentrant {
        require(bytes(name).length > 0, "Invalid name");
        require(bytes(industry).length > 0, "Invalid industry");
        require(bytes(fundingStage).length > 0, "Invalid funding stage");
        require(bytes(details).length > 0, "Invalid details");
        
        // Validate percentages
        require(cogs <= 100, "Invalid COGS percentage");
        require(marketing <= 100, "Invalid marketing percentage");
        require(cac <= 100, "Invalid CAC percentage");
        require(logistics <= 100, "Invalid logistics percentage");
        require(grossMargin <= 100, "Invalid gross margin");
        require(ebitda <= 100, "Invalid EBITDA percentage");
        require(salaries <= 100, "Invalid salaries percentage");
        require(misc <= 100, "Invalid misc percentage");
        require(pat <= 100, "Invalid PAT percentage");

        Financials memory financials = Financials({
            arr: arr,
            mrr: mrr,
            cogs: cogs,
            marketing: marketing,
            cac: cac,
            logistics: logistics,
            grossMargin: grossMargin,
            ebitda: ebitda,
            salaries: salaries,
            misc: misc,
            pat: pat
        });

        startups[msg.sender] = StartupInfo({
            name: name,
            industry: industry,
            fundingStage: fundingStage,
            details: details,
            financials: financials,
            registrationTime: block.timestamp,
            isActive: true
        });

        hasRegisteredStartup[msg.sender] = true;

        emit StartupRegistered(msg.sender, name, industry, block.timestamp);
    }

    function updateStartupFinancials(
        uint256 arr,
        uint256 mrr,
        uint8 cogs,
        uint8 marketing,
        uint8 cac,
        uint8 logistics,
        uint8 grossMargin,
        uint8 ebitda,
        uint8 salaries,
        uint8 misc,
        uint8 pat
    ) external nonReentrant {
        require(hasRegisteredStartup[msg.sender], "No startup registered");
        require(startups[msg.sender].isActive, "Startup not active");

        // Validate percentages
        require(cogs <= 100, "Invalid COGS percentage");
        require(marketing <= 100, "Invalid marketing percentage");
        require(cac <= 100, "Invalid CAC percentage");
        require(logistics <= 100, "Invalid logistics percentage");
        require(grossMargin <= 100, "Invalid gross margin");
        require(ebitda <= 100, "Invalid EBITDA percentage");
        require(salaries <= 100, "Invalid salaries percentage");
        require(misc <= 100, "Invalid misc percentage");
        require(pat <= 100, "Invalid PAT percentage");

        startups[msg.sender].financials = Financials({
            arr: arr,
            mrr: mrr,
            cogs: cogs,
            marketing: marketing,
            cac: cac,
            logistics: logistics,
            grossMargin: grossMargin,
            ebitda: ebitda,
            salaries: salaries,
            misc: misc,
            pat: pat
        });

        emit StartupUpdated(
            msg.sender,
            startups[msg.sender].name,
            block.timestamp
        );
    }

    function getStartupInfo(address wallet) external view returns (
        string memory name,
        string memory industry,
        string memory fundingStage,
        string memory details,
        uint256 arr,
        uint256 mrr,
        uint8 cogs,
        uint8 marketing,
        uint8 cac,
        uint8 logistics,
        uint8 grossMargin,
        uint8 ebitda,
        uint8 salaries,
        uint8 misc,
        uint8 pat,
        uint256 registrationTime,
        bool isActive
    ) {
        require(hasRegisteredStartup[wallet], "No startup found");
        StartupInfo storage info = startups[wallet];
        return (
            info.name,
            info.industry,
            info.fundingStage,
            info.details,
            info.financials.arr,
            info.financials.mrr,
            info.financials.cogs,
            info.financials.marketing,
            info.financials.cac,
            info.financials.logistics,
            info.financials.grossMargin,
            info.financials.ebitda,
            info.financials.salaries,
            info.financials.misc,
            info.financials.pat,
            info.registrationTime,
            info.isActive
        );
    }
}