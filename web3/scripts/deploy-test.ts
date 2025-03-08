import { ethers } from "hardhat";

async function main() {
  console.log("Deploying test contract...");
  
  const Factory = await ethers.getContractFactory("EquityNFTFactory");
  const factory = await Factory.deploy({
    gasLimit: 5000000,
    gasPrice: ethers.parseUnits("50", "gwei"), // Using legacy gasPrice instead of maxFeePerGas
    type: 0 // Force legacy transaction type
  });

  await factory.waitForDeployment();
  console.log("Factory deployed to:", await factory.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});