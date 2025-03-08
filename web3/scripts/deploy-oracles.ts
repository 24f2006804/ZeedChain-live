import { ethers } from "hardhat";

async function main() {
  console.log("Deploying oracle contracts to Arbitrum Sepolia...");

  // Deploy AIAdvisorIntegration with Chainlink Functions parameters
  const routerAddress = "0xb83E47C2bC239B3bf370bc41e1459A34b41238D0"; // Chainlink Functions Router on Arbitrum Sepolia
  const subscriptionId = 0n; // You'll need to create a subscription and fund it
  const donId = "0x66756e2d617262697472756d2d7365706f6c69612d3100000000000000000000"; // Functions DON ID for Arbitrum Sepolia
  const source = ethers.encodeBytes32String("// AI Advisor source code will go here");

  const AIAdvisorIntegration = await ethers.getContractFactory("AIAdvisorIntegration");
  const aiAdvisorIntegration = await AIAdvisorIntegration.deploy(
    routerAddress,
    subscriptionId,
    donId,
    source
  );
  await aiAdvisorIntegration.waitForDeployment();
  console.log("AIAdvisorIntegration deployed to:", await aiAdvisorIntegration.getAddress());

  // Deploy the other oracle contracts
  const FinancialDataOracle = await ethers.getContractFactory("FinancialDataOracle");
  await performanceMetricsOracle.waitForDeployment();
  console.log("PerformanceMetricsOracle deployed to:", await performanceMetricsOracle.getAddress());

  // Deploy VerificationOracle
  const VerificationOracle = await ethers.getContractFactory("VerificationOracle");
  const verificationOracle = await VerificationOracle.deploy();
  await verificationOracle.waitForDeployment();
  console.log("VerificationOracle deployed to:", await verificationOracle.getAddress());

  console.log("\nOracle Deployment Complete!");
  console.log("\nContract Addresses on Arbitrum Sepolia:");
  console.log("-------------------------------------");
  console.log("AIAdvisorIntegration:", await aiAdvisorIntegration.getAddress());
  console.log("FinancialDataOracle:", await financialDataOracle.getAddress());
  console.log("PerformanceMetricsOracle:", await performanceMetricsOracle.getAddress());
  console.log("VerificationOracle:", await verificationOracle.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});