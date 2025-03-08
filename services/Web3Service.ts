import { ethers } from 'ethers';
import deployedContracts from '../web3/deployed-contracts.json';

export class Web3Service {
  private provider: ethers.providers.Web3Provider;
  private kycContract: ethers.Contract;
  private startupContract: ethers.Contract;

  constructor() {
    if (typeof window !== 'undefined' && window.ethereum) {
      this.provider = new ethers.providers.Web3Provider(window.ethereum);
      this.kycContract = new ethers.Contract(
        deployedContracts.KYC.address,
        deployedContracts.KYC.abi,
        this.provider
      );
      this.startupContract = new ethers.Contract(
        deployedContracts.Startup.address,
        deployedContracts.Startup.abi,
        this.provider
      );
    }
  }

  async checkWalletKYCStatus(walletAddress: string): Promise<boolean> {
    try {
      return await this.kycContract.hasCompletedKYC(walletAddress);
    } catch (error) {
      console.error('Error checking KYC status:', error);
      return false;
    }
  }

  async checkWalletStartup(walletAddress: string): Promise<boolean> {
    try {
      return await this.startupContract.hasRegisteredStartup(walletAddress);
    } catch (error) {
      console.error('Error checking startup status:', error);
      return false;
    }
  }

  async registerStartup(startupData: any): Promise<boolean> {
    try {
      const signer = this.provider.getSigner();
      const startupWithSigner = this.startupContract.connect(signer);
      
      // Convert data to match contract structure
      const startupInfo = {
        name: startupData.name,
        industry: startupData.industry,
        fundingStage: startupData.funding,
        details: startupData.details,
        financials: {
          arr: ethers.utils.parseEther(startupData.arr.replace(/[^0-9.]/g, '')),
          mrr: ethers.utils.parseEther(startupData.mrr.replace(/[^0-9.]/g, '')),
          cogs: parseInt(startupData.cogs),
          marketing: parseInt(startupData.marketing),
          cac: parseInt(startupData.cac),
          logistics: parseInt(startupData.logistics),
          grossMargin: parseInt(startupData.grossMargin),
          ebitda: parseInt(startupData.ebitda),
          salaries: parseInt(startupData.salaries),
          misc: parseInt(startupData.miscPercentage),
          pat: parseInt(startupData.pat)
        }
      };

      const tx = await startupWithSigner.registerStartup(startupInfo);
      await tx.wait();
      return true;
    } catch (error) {
      console.error('Error registering startup:', error);
      return false;
    }
  }

  async completeKYC(kycData: any): Promise<boolean> {
    try {
      const signer = this.provider.getSigner();
      const kycWithSigner = this.kycContract.connect(signer);
      
      const tx = await kycWithSigner.completeKYC(
        kycData.founderName,
        kycData.aadharNumber,
        kycData.panNumber,
        kycData.ipfsLink // Contains uploaded docs including selfie
      );
      await tx.wait();
      return true;
    } catch (error) {
      console.error('Error completing KYC:', error);
      return false;
    }
  }
}