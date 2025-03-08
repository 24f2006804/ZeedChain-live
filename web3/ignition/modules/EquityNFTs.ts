import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
import { ethers } from 'ethers';

export default buildModule("EquityNFTs", (m) => {
  // Deploy just the factory contract as a test
  const equityNFTFactory = m.contract("EquityNFTFactory", [], { 
    id: "factory_core",
    overrides: { 
      gasLimit: 15000000,
      maxFeePerGas: ethers.parseUnits("100", "gwei"),
      maxPriorityFeePerGas: ethers.parseUnits("50", "gwei")
    }
  });

  return {
    equityNFTFactory
  };
});