import { ethers } from "hardhat";
import { EDUCHAIN } from "../utils/config";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Deploy EquityNFTFactory
  const EquityNFTFactory = await ethers.getContractFactory("EquityNFTFactory");
  const equityNFTFactory = await EquityNFTFactory.deploy();
  await equityNFTFactory.waitForDeployment();
  console.log("EquityNFTFactory deployed to:", await equityNFTFactory.getAddress());

  // Deploy FractionalInvestment
  const FractionalInvestment = await ethers.getContractFactory("FractionalInvestment");
  const fractionalInvestment = await FractionalInvestment.deploy(await equityNFTFactory.getAddress(), deployer.address);
  await fractionalInvestment.waitForDeployment();
  console.log("FractionalInvestment deployed to:", await fractionalInvestment.getAddress());

  // Deploy DynamicValuation
  const DynamicValuation = await ethers.getContractFactory("DynamicValuation");
  const dynamicValuation = await DynamicValuation.deploy(await equityNFTFactory.getAddress());
  await dynamicValuation.waitForDeployment();
  console.log("DynamicValuation deployed to:", await dynamicValuation.getAddress());

  // Deploy StartupValidation
  const StartupValidation = await ethers.getContractFactory("StartupValidation");
  const startupValidation = await StartupValidation.deploy(await equityNFTFactory.getAddress(), 3);
  await startupValidation.waitForDeployment();
  console.log("StartupValidation deployed to:", await startupValidation.getAddress());

  // Deploy StakeholderGovernance
  const StakeholderGovernance = await ethers.getContractFactory("StakeholderGovernance");
  const stakeholderGovernance = await StakeholderGovernance.deploy(await fractionalInvestment.getAddress());
  await stakeholderGovernance.waitForDeployment();
  console.log("StakeholderGovernance deployed to:", await stakeholderGovernance.getAddress());

  // Deploy ProfitDistribution
  const ProfitDistribution = await ethers.getContractFactory("ProfitDistribution");
  const profitDistribution = await ProfitDistribution.deploy(await fractionalInvestment.getAddress());
  await profitDistribution.waitForDeployment();
  console.log("ProfitDistribution deployed to:", await profitDistribution.getAddress());

  // Deploy AIAdvisor with correct parameters
  const AIAdvisorIntegration = await ethers.getContractFactory("AIAdvisorIntegration");
  const aiAdvisor = await AIAdvisorIntegration.deploy(
    EDUCHAIN.CHAINLINK_ORACLE,
    352n, // Direct BigInt value for uint64
    EDUCHAIN.FUNCTIONS_DON_ID,
    ethers.toUtf8Bytes("ai_source")
  );
  await aiAdvisor.waitForDeployment();
  console.log("AIAdvisorIntegration deployed to:", await aiAdvisor.getAddress());

  // Deploy Financial Data Oracle
  const FinancialDataOracle = await ethers.getContractFactory("FinancialDataOracle");
  const financialDataOracle = await FinancialDataOracle.deploy(
    EDUCHAIN.CHAINLINK_ORACLE, // router address
    352n, // subscriptionId as uint64
    EDUCHAIN.FUNCTIONS_DON_ID, // donId
    ethers.toUtf8Bytes("financial_source") // source as bytes
  );
  await financialDataOracle.waitForDeployment();
  console.log("FinancialDataOracle deployed to:", await financialDataOracle.getAddress());

  // Deploy Verification Oracle
  const kycJobId = "kyc-verification-job";
  const amlJobId = "aml-check-job";
  const credentialsJobId = "credentials-validation-job";

  const VerificationOracle = await ethers.getContractFactory("VerificationOracle");
  const verificationOracle = await VerificationOracle.deploy(
    EDUCHAIN.CHAINLINK_ORACLE, // router address
    352n, // subscriptionId as uint64
    EDUCHAIN.FUNCTIONS_DON_ID, // donId
    ethers.toUtf8Bytes("kyc-verification-job"),
    ethers.toUtf8Bytes("aml-check-job"),
    ethers.toUtf8Bytes("credentials-validation-job")
  );
  await verificationOracle.waitForDeployment();
  console.log("VerificationOracle deployed to:", await verificationOracle.getAddress());

  // Deploy Performance Metrics Oracle
  const PerformanceMetricsOracle = await ethers.getContractFactory("PerformanceMetricsOracle");
  const performanceMetricsOracle = await PerformanceMetricsOracle.deploy(
    EDUCHAIN.CHAINLINK_ORACLE, // router address
    352n, // subscriptionId as uint64
    EDUCHAIN.FUNCTIONS_DON_ID, // donId
    ethers.toUtf8Bytes("performance_source") // source as bytes
  );
  await performanceMetricsOracle.waitForDeployment();
  console.log("PerformanceMetricsOracle deployed to:", await performanceMetricsOracle.getAddress());

  // Set up initial configuration
  // Add deployer as validator in EquityNFTFactory
  await equityNFTFactory.addValidator(deployer.address);
  console.log("Initial setup completed");

  // Save deployment addresses
  const deployedContracts = {
    equityNFTFactory: await equityNFTFactory.getAddress(),
    fractionalInvestment: await fractionalInvestment.getAddress(),
    dynamicValuation: await dynamicValuation.getAddress(),
    startupValidation: await startupValidation.getAddress(),
    stakeholderGovernance: await stakeholderGovernance.getAddress(),
    profitDistribution: await profitDistribution.getAddress(),
    aiAdvisor: await aiAdvisor.getAddress(),
    financialDataOracle: await financialDataOracle.getAddress(),
    verificationOracle: await verificationOracle.getAddress(),
    performanceMetricsOracle: await performanceMetricsOracle.getAddress()
  };
  console.log("Deployed contract addresses:", deployedContracts);

  // Write deployed addresses to a file for future reference
  const fs = require("fs");
  fs.writeFileSync(
    "deployed-contracts.json",
    JSON.stringify(deployedContracts, null, 2)
  );
  console.log("Deployment addresses saved to deployed-contracts.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });