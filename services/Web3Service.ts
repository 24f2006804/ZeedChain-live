import { JsonRpcProvider, Web3Provider } from '@ethersproject/providers';
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
import { BigNumber } from '@ethersproject/bignumber';

export interface StartupDetails {
  name: string;
  description: string;
  valuation: BigNumber;
  totalShares: BigNumber;
  availableShares: BigNumber;
  founder: string;
  isValidated: boolean;
}

export class Web3Service {
  private provider: Web3Provider;
  private kycContract!: VerificationOracle;
  private startupContract!: StartupValidation;
  private fractionalInvestmentContract!: FractionalInvestment;
  private startupId?: BigNumber;
  
  constructor(provider: Web3Provider) {
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
      this.fractionalInvestmentContract = FractionalInvestment__factory.connect(
        deployedContracts.fractionalInvestment,
        signer
      );
    }
  }

  async getTotalStartups(): Promise<number> {
    const count = await this.startupContract.totalStartups();
    return count.toNumber();
  }

  async getStartupDetails(startupId: number): Promise<StartupDetails> {
    const details = await this.startupContract.startups(BigNumber.from(startupId));
    const isValidated = await this.startupContract.isStartupValidated(BigNumber.from(startupId));
    
    return {
      name: details.name,
      description: details.description,
      valuation: details.valuation,
      totalShares: details.totalShares,
      availableShares: details.availableShares,
      founder: details.founder,
      isValidated
    };
  }

  async getStartupInvestorCount(startupId: number): Promise<number> {
    const count = await this.fractionalInvestmentContract.getInvestorCount(BigNumber.from(startupId));
    return count.toNumber();
  }

  async getStartupTotalInvestment(startupId: number): Promise<BigNumber> {
    return await this.fractionalInvestmentContract.getTotalInvestment(BigNumber.from(startupId));
  }

  async invest(startupId: number, amount: BigNumber): Promise<boolean> {
    try {
      const tx = await this.fractionalInvestmentContract.invest(BigNumber.from(startupId), {
        value: amount
      });
      await tx.wait();
      return true;
    } catch (error) {
      console.error('Error investing:', error);
      return false;
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
      const validationStatus = await this.startupContract.validationRequests(this.startupId || BigNumber.from(0));
      if (validationStatus.founder.toLowerCase() === walletAddress.toLowerCase()) {
        // Use BigNumber comparison for status
        return validationStatus.status.eq(BigNumber.from(1)); // Assuming 1 means approved
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
      // Use BigNumber addition for ID generation
      const startupId = validatorCount.add(BigNumber.from(1));
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