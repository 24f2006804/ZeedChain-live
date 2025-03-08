import { ethers } from "hardhat";
import { Contract } from "ethers";

// Complete ABI fragments including events
const FACTORY_ABI = [
  "function addValidator(address validator) external",
  "function registerStartup(string memory name, string memory description, uint256 totalShares, uint256 initialValuation) external returns (uint256)",
  "function validateStartup(uint256 tokenId, bool status) external",
  "function addTrustedIssuer(address issuer) external",
  "function trustedIssuers(address) external view returns (bool)",
  "event StartupRegistered(uint256 indexed tokenId, string name, address founder)",
  "event StartupValidated(uint256 indexed tokenId, bool status)",
  "event TrustedIssuerUpdated(address indexed issuer, bool status)"
];

const INVESTMENT_ABI = [
  "function invest(uint256 startupId) external payable",
  "event InvestmentMade(uint256 indexed startupId, address indexed investor, uint256 shares, uint256 amount, uint256 sharePrice)"
];

async function main() {
  // Get provider and signer
  const provider = new ethers.JsonRpcProvider("https://rpc.open-campus-codex.gelato.digital");
  const privateKey = process.env.ACCOUNT_PRIVATE_KEY;
  if (!privateKey) throw new Error("Private key not found");
  
  const wallet = new ethers.Wallet(privateKey, provider);
  console.log("Using wallet address:", wallet.address);

  // Get deployed contract addresses
  const factoryAddress = process.env.FACTORY_ADDRESS;
  const investmentAddress = process.env.FRACTIONAL_INVESTMENT_ADDRESS;

  if (!factoryAddress || !investmentAddress) {
    throw new Error("Missing contract addresses");
  }

  try {
    // Create contract instances
    console.log("Connecting to contracts...");
    const equityFactory = new Contract(factoryAddress, FACTORY_ABI, wallet);
    const fractionalInvestment = new Contract(investmentAddress, INVESTMENT_ABI, wallet);

    console.log("Adding validator...");
    const addValidatorTx = await equityFactory.addValidator(wallet.address);
    await addValidatorTx.wait();
    console.log("Validator added successfully");

    // Sample startup data
    const startups = [
      {
        name: "TechFlow AI",
        description: "AI-powered workflow automation platform",
        totalShares: 1000000,
        valuation: ethers.parseEther("5000") // 5000 ETH
      },
      {
        name: "GreenChain",
        description: "Blockchain solution for carbon credit trading",
        totalShares: 2000000,
        valuation: ethers.parseEther("8000") // 8000 ETH
      }
    ];

    // Register startups
    console.log("Registering startups...");
    for (const startup of startups) {
      console.log(`\nRegistering ${startup.name}...`);
      const registerTx = await equityFactory.registerStartup(
        startup.name,
        startup.description,
        startup.totalShares,
        startup.valuation
      );
      const receipt = await registerTx.wait();
      
      // Find StartupRegistered event
      const startupRegisteredEvent = receipt.logs.find(log => {
        try {
          const parsedLog = equityFactory.interface.parseLog(log);
          return parsedLog.name === "StartupRegistered";
        } catch (e) {
          return false;
        }
      });
      
      if (!startupRegisteredEvent) {
        throw new Error("StartupRegistered event not found in transaction logs");
      }

      const parsedEvent = equityFactory.interface.parseLog(startupRegisteredEvent);
      const startupId = parsedEvent.args[0];
      console.log(`Registered ${startup.name} with ID ${startupId}`);

      // Validate startup
      console.log("Validating startup...");
      const validateTx = await equityFactory.validateStartup(startupId, true);
      await validateTx.wait();
      console.log("Startup validated");

      // Add FractionalInvestment as trusted issuer if not already
      const isTrustedIssuer = await equityFactory.trustedIssuers(fractionalInvestment.target);
      if (!isTrustedIssuer) {
        console.log("Adding FractionalInvestment as trusted issuer...");
        const addIssuerTx = await equityFactory.addTrustedIssuer(fractionalInvestment.target);
        await addIssuerTx.wait();
        console.log("Added as trusted issuer");
      }

      // Make investment
      console.log("Making investment...");
      const investmentAmount = ethers.parseEther("1"); // 1 ETH
      console.log(`Investing ${ethers.formatEther(investmentAmount)} ETH...`);
      const investTx = await fractionalInvestment.invest(startupId, { value: investmentAmount });
      await investTx.wait();
      console.log("Investment successful");
    }

    console.log("\nAll dummy data added successfully!");
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});