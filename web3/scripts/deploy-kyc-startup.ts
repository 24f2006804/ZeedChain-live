import { ethers } from 'hardhat';
import fs from 'fs';
import path from 'path';

async function main() {
  console.log('Deploying KYC and Startup contracts...');

  // Deploy KYC contract
  const KYC = await ethers.getContractFactory('KYC');
  const kyc = await KYC.deploy();
  await kyc.deployed();
  console.log('KYC contract deployed to:', kyc.address);

  // Deploy Startup contract with KYC address
  const Startup = await ethers.getContractFactory('Startup');
  const startup = await Startup.deploy(kyc.address);
  await startup.deployed();
  console.log('Startup contract deployed to:', startup.address);

  // Update deployed-contracts.json
  const deployedContractsPath = path.join(__dirname, '..', 'deployed-contracts.json');
  let deployedContracts = {};
  
  if (fs.existsSync(deployedContractsPath)) {
    const content = fs.readFileSync(deployedContractsPath, 'utf8');
    deployedContracts = JSON.parse(content);
  }

  // Update with new contract addresses
  deployedContracts.KYC = {
    address: kyc.address,
    abi: JSON.parse(kyc.interface.format('json'))
  };

  deployedContracts.Startup = {
    address: startup.address,
    abi: JSON.parse(startup.interface.format('json'))
  };

  // Write back to file
  fs.writeFileSync(
    deployedContractsPath,
    JSON.stringify(deployedContracts, null, 2)
  );

  console.log('Deployment complete and contracts.json updated');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });