import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log("Starting deployment...");

  // Deploy core factory first
  console.log("Deploying EquityNFTFactory...");
  const EquityNFTFactory = await ethers.getContractFactory("EquityNFTFactory");
  const equityNFTFactory = await EquityNFTFactory.deploy();
  await equityNFTFactory.waitForDeployment();
  const factoryAddress = await equityNFTFactory.getAddress();
  console.log("EquityNFTFactory deployed to:", factoryAddress);

  // Get deployer address for roles
  const [deployer] = await ethers.getSigners();
  const deployerAddress = await deployer.getAddress();

  // Deploy FractionalInvestment
  console.log("Deploying FractionalInvestment...");
  const FractionalInvestment = await ethers.getContractFactory("FractionalInvestment");
  const fractionalInvestment = await FractionalInvestment.deploy(
    factoryAddress,
    deployerAddress // Using deployer as fee collector
  );
  await fractionalInvestment.waitForDeployment();
  console.log("FractionalInvestment deployed to:", await fractionalInvestment.getAddress());

  // Deploy DynamicValuation
  console.log("Deploying DynamicValuation...");
  const DynamicValuation = await ethers.getContractFactory("DynamicValuation");
  const dynamicValuation = await DynamicValuation.deploy(factoryAddress);
  await dynamicValuation.waitForDeployment();
  console.log("DynamicValuation deployed to:", await dynamicValuation.getAddress());

  // Deploy StakeholderGovernance
  console.log("Deploying StakeholderGovernance...");
  const StakeholderGovernance = await ethers.getContractFactory("StakeholderGovernance");
  const stakeholderGovernance = await StakeholderGovernance.deploy(await fractionalInvestment.getAddress());
  await stakeholderGovernance.waitForDeployment();
  console.log("StakeholderGovernance deployed to:", await stakeholderGovernance.getAddress());

  // Deploy StartupValidation
  console.log("Deploying StartupValidation...");
  const StartupValidation = await ethers.getContractFactory("StartupValidation");
  const startupValidation = await StartupValidation.deploy(factoryAddress, 3);
  await startupValidation.waitForDeployment();
  console.log("StartupValidation deployed to:", await startupValidation.getAddress());

  // Deploy ProfitDistribution
  console.log("Deploying ProfitDistribution...");
  const ProfitDistribution = await ethers.getContractFactory("ProfitDistribution");
  const profitDistribution = await ProfitDistribution.deploy(await fractionalInvestment.getAddress());
  await profitDistribution.waitForDeployment();
  console.log("ProfitDistribution deployed to:", await profitDistribution.getAddress());

  // Deploy Oracles with Chainlink Functions integration
  console.log("Deploying Oracles...");
  
  const LINK_TOKEN = "0x779877A7B0D9E8603169DdbD7836e478b4624789";
  const subscriptionId = 1;
  const donId = ethers.id("functions-don-1");

  // Deploy AIAdvisorIntegration
  const AIAdvisorIntegration = await ethers.getContractFactory("AIAdvisorIntegration");
  const aiAdvisor = await AIAdvisorIntegration.deploy(
    LINK_TOKEN,
    subscriptionId,
    donId,
    ethers.encodeBytes32String("ai_source")
  );
  await aiAdvisor.waitForDeployment();
  console.log("AIAdvisorIntegration deployed to:", await aiAdvisor.getAddress());

  // Deploy FinancialDataOracle
  const FinancialDataOracle = await ethers.getContractFactory("FinancialDataOracle");
  const financialDataOracle = await FinancialDataOracle.deploy(
    LINK_TOKEN,
    subscriptionId,
    donId,
    ethers.encodeBytes32String("financial_source")
  );
  await financialDataOracle.waitForDeployment();
  console.log("FinancialDataOracle deployed to:", await financialDataOracle.getAddress());

  // Deploy VerificationOracle
  const VerificationOracle = await ethers.getContractFactory("VerificationOracle");
  const verificationOracle = await VerificationOracle.deploy(
    LINK_TOKEN,
    subscriptionId,
    donId,
    ethers.encodeBytes32String("kyc_source"),
    ethers.encodeBytes32String("aml_source"),
    ethers.encodeBytes32String("credentials_source")
  );
  await verificationOracle.waitForDeployment();
  console.log("VerificationOracle deployed to:", await verificationOracle.getAddress());

  // Deploy PerformanceMetricsOracle
  const PerformanceMetricsOracle = await ethers.getContractFactory("PerformanceMetricsOracle");
  const performanceMetricsOracle = await PerformanceMetricsOracle.deploy(
    LINK_TOKEN,
    subscriptionId,
    donId,
    ethers.encodeBytes32String("metrics_source")
  );
  await performanceMetricsOracle.waitForDeployment();
  console.log("PerformanceMetricsOracle deployed to:", await performanceMetricsOracle.getAddress());

  // Set up roles
  console.log("Setting up roles...");
  
  const METRICS_PROVIDER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("METRICS_PROVIDER_ROLE"));
  const VALIDATOR_ROLE = ethers.keccak256(ethers.toUtf8Bytes("VALIDATOR_ROLE"));

  await performanceMetricsOracle.grantRole(METRICS_PROVIDER_ROLE, deployerAddress);
  await performanceMetricsOracle.grantRole(VALIDATOR_ROLE, deployerAddress);
  await equityNFTFactory.addValidator(deployerAddress);

  // Save deployment addresses
  const deployedContracts = {
    equityNFTFactory: await equityNFTFactory.getAddress(),
    fractionalInvestment: await fractionalInvestment.getAddress(),
    dynamicValuation: await dynamicValuation.getAddress(),
    stakeholderGovernance: await stakeholderGovernance.getAddress(),
    startupValidation: await startupValidation.getAddress(),
    profitDistribution: await profitDistribution.getAddress(),
    aiAdvisor: await aiAdvisor.getAddress(),
    financialDataOracle: await financialDataOracle.getAddress(),
    verificationOracle: await verificationOracle.getAddress(),
    performanceMetricsOracle: await performanceMetricsOracle.getAddress(),
  };

  // Save addresses to file
  fs.writeFileSync(
    path.join(__dirname, "..", "deployed-contracts.json"),
    JSON.stringify(deployedContracts, null, 2)
  );

  console.log("All contracts deployed successfully!");
  console.log("Deployment addresses saved to deployed-contracts.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });