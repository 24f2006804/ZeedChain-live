import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  
  // Get the factory contract
  const factoryAddress = require("../deployed-contracts.json").EquityNFTFactory;
  const factory = await ethers.getContractAt("EquityNFTFactory", factoryAddress);

  // Add some dummy startups
  const startups = [
    {
      name: "EcoTech Solutions",
      description: "Developing sustainable energy storage solutions using recyclable materials. Our innovative battery technology increases efficiency while reducing environmental impact.",
      totalShares: ethers.parseEther("1000000"),  // 1M shares
      valuation: ethers.parseEther("5000000")     // $5M valuation
    },
    {
      name: "HealthAI Platform",
      description: "AI-powered healthcare diagnostics platform that helps doctors make faster and more accurate diagnoses using machine learning algorithms.",
      totalShares: ethers.parseEther("800000"),   // 800K shares
      valuation: ethers.parseEther("3000000")     // $3M valuation
    },
    {
      name: "CryptoSecure",
      description: "Next-generation blockchain security solution that protects digital assets using quantum-resistant encryption methods.",
      totalShares: ethers.parseEther("1200000"),  // 1.2M shares
      valuation: ethers.parseEther("7000000")     // $7M valuation
    },
    {
      name: "AgriTech Innovations",
      description: "Smart farming solutions using IoT sensors and automation to optimize crop yields and reduce resource consumption.",
      totalShares: ethers.parseEther("500000"),   // 500K shares
      valuation: ethers.parseEther("2000000")     // $2M valuation
    }
  ];

  console.log("Adding dummy startups...");

  for (const startup of startups) {
    console.log(`Registering ${startup.name}...`);
    const tx = await factory.registerStartup(
      startup.name,
      startup.description,
      startup.totalShares,
      startup.valuation
    );
    await tx.wait();
    
    // Get the latest token ID
    const tokenId = await factory.totalStartups();
    
    // Validate the startup
    if (await factory.validators(deployer.address)) {
      console.log(`Validating ${startup.name}...`);
      await factory.validateStartup(tokenId, true);
    } else {
      console.log("Adding deployer as validator...");
      await factory.addValidator(deployer.address);
      console.log(`Validating ${startup.name}...`);
      await factory.validateStartup(tokenId, true);
    }
  }

  console.log("All dummy startups have been added and validated!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });