import type { BaseContract, BigNumberish } from 'ethers';
import { 
  EquityNFTFactory__factory,
  VerificationOracle__factory,
  FinancialDataOracle__factory,
  PerformanceMetricsOracle__factory,
  AIAdvisorIntegration__factory,
  StakeholderGovernance__factory,
  ProfitDistribution__factory,
  DynamicValuation__factory,
  FractionalInvestment__factory
} from '../web3/typechain-types/factories/contracts';
import { StartupValidation__factory } from '../web3/typechain-types/factories/contracts/StartupValidation__factory';
import type {
  EquityNFTFactory,
  VerificationOracle,
  FinancialDataOracle,
  PerformanceMetricsOracle,
  AIAdvisorIntegration,
  StakeholderGovernance,
  ProfitDistribution,
  DynamicValuation,
  FractionalInvestment,
  StartupValidation
} from '../web3/typechain-types/contracts';
import deployedContracts from '../web3/deployed-contracts.json';
import { CONTRACT_ADDRESSES } from '../client/config/web3';
import * as ethers from 'ethers';
import { sendEth } from '../client/utils/metamask-helper';

export class Web3Service {
  private provider: ethers.BrowserProvider;
  private kycContract!: VerificationOracle;
  private startupContract!: StartupValidation;
  private startupId?: bigint;
  
  constructor(provider: ethers.BrowserProvider) {
    this.provider = provider;
  }

  async init() {
    if (typeof window !== 'undefined') {
      const signer = await this.provider.getSigner();
      this.kycContract = VerificationOracle__factory.connect(
        deployedContracts.verificationOracle,
        signer
      );
      this.startupContract = StartupValidation__factory.connect(
        deployedContracts.startupValidation,
        signer
      );
    }
  }

  async checkWalletKYCStatus(walletAddress: string): Promise<boolean> {
    try {
      const status = await this.kycContract.getVerificationStatus(walletAddress);
      return status.kycPassed && status.isValid;
    } catch (error) {
      console.error('Error checking KYC status:', error);
      return false;
    }
  }

  async checkWalletStartup(walletAddress: string): Promise<boolean> {
    try {
      // Find the startup ID for this wallet first
      const signer = await this.provider.getSigner();
      const signerAddress = await signer.getAddress();
      
      // Load all validation requests and find matching one
      const validationStatus = await this.startupContract.validationRequests(this.startupId || BigInt(0));
      if (validationStatus.founder.toLowerCase() === walletAddress.toLowerCase()) {
        return validationStatus.status === BigInt(1); // Assuming 1 means approved
      }
      return false;
    } catch (error) {
      console.error('Error checking startup status:', error);
      return false;
    }
  }

  async registerStartup(startupData: any): Promise<boolean> {
    try {
      const signer = await this.provider.getSigner();
      const startupWithSigner = this.startupContract.connect(signer);
      
      // Generate IPFS hash of startup data (this should be done separately)
      const documentHash = startupData.ipfsHash;

      // Request validation with a new startup ID
      const validatorCount = await this.startupContract.getValidatorCount();
      const startupId = validatorCount + BigInt(1); // Simple ID generation
      this.startupId = startupId;

      const tx = await startupWithSigner.requestValidation(
        startupId,
        documentHash
      );
      await tx.wait();
      return true;
    } catch (error) {
      console.error('Error registering startup:', error);
      return false;
    }
  }

  async completeKYC(kycData: any): Promise<boolean> {
    try {
      const signer = await this.provider.getSigner();
      const kycWithSigner = this.kycContract.connect(signer);
      
      const tx = await kycWithSigner.requestVerification(
        await signer.getAddress(),
        kycData.ipfsHash // Contains uploaded docs including selfie, aadhar, pan, etc.
      );
      await tx.wait();
      return true;
    } catch (error) {
      console.error('Error completing KYC:', error);
      return false;
    }
  }
}