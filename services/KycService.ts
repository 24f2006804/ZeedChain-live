import { toast } from 'sonner';

// KYC verification status
export enum KycStatus {
  NOT_STARTED = 'NOT_STARTED',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

// KYC verification level
export enum KycLevel {
  NONE = 0,
  BASIC = 1,
  ADVANCED = 2
}

// User KYC data
export interface KycData {
  status: KycStatus;
  level: KycLevel;
  fullName?: string;
  email?: string;
  country?: string;
  idType?: string;
  idNumber?: string;
  idExpiry?: string;
  idDocument?: string;
  addressDocument?: string;
  selfieImage?: string;
  submittedAt?: number;
  approvedAt?: number;
  rejectedAt?: number;
  rejectionReason?: string;
}

/**
 * Service for handling KYC verification
 */
export class KycService {
  private static instance: KycService;
  
  // Store KYC data in localStorage
  private readonly STORAGE_KEY = 'zeedchain_kyc_data';
  
  private constructor() {
    // Private constructor to enforce singleton pattern
  }
  
  /**
   * Get the singleton instance
   */
  public static getInstance(): KycService {
    if (!KycService.instance) {
      KycService.instance = new KycService();
    }
    return KycService.instance;
  }
  
  /**
   * Get KYC data for a wallet address
   */
  public getKycData(walletAddress: string): KycData {
    try {
      const data = localStorage.getItem(`${this.STORAGE_KEY}_${walletAddress.toLowerCase()}`);
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error getting KYC data:', error);
    }
    
    // Return default data if not found
    return {
      status: KycStatus.NOT_STARTED,
      level: KycLevel.NONE
    };
  }
  
  /**
   * Save KYC data for a wallet address
   */
  private saveKycData(walletAddress: string, data: KycData): void {
    try {
      localStorage.setItem(
        `${this.STORAGE_KEY}_${walletAddress.toLowerCase()}`,
        JSON.stringify(data)
      );
    } catch (error) {
      console.error('Error saving KYC data:', error);
      toast.error('Failed to save KYC data');
    }
  }
  
  /**
   * Submit basic KYC verification
   */
  public async submitBasicKyc(
    walletAddress: string,
    fullName: string,
    email: string,
    country: string
  ): Promise<boolean> {
    try {
      // Get current data
      const currentData = this.getKycData(walletAddress);
      
      // Update with new data
      const updatedData: KycData = {
        ...currentData,
        status: KycStatus.PENDING,
        fullName,
        email,
        country,
        submittedAt: Date.now()
      };
      
      // Save updated data
      this.saveKycData(walletAddress, updatedData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Basic KYC verification submitted successfully');
      return true;
    } catch (error) {
      console.error('Error submitting basic KYC:', error);
      toast.error('Failed to submit KYC verification');
      return false;
    }
  }
  
  /**
   * Submit advanced KYC verification
   */
  public async submitAdvancedKyc(
    walletAddress: string,
    idType: string,
    idNumber: string,
    idExpiry: string,
    idDocument: string,
    addressDocument: string,
    selfieImage: string
  ): Promise<boolean> {
    try {
      // Get current data
      const currentData = this.getKycData(walletAddress);
      
      // Check if basic KYC is completed
      if (currentData.level < KycLevel.BASIC) {
        toast.error('Please complete basic KYC verification first');
        return false;
      }
      
      // Update with new data
      const updatedData: KycData = {
        ...currentData,
        status: KycStatus.PENDING,
        idType,
        idNumber,
        idExpiry,
        idDocument,
        addressDocument,
        selfieImage,
        submittedAt: Date.now()
      };
      
      // Save updated data
      this.saveKycData(walletAddress, updatedData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Advanced KYC verification submitted successfully');
      return true;
    } catch (error) {
      console.error('Error submitting advanced KYC:', error);
      toast.error('Failed to submit KYC verification');
      return false;
    }
  }
  
  /**
   * Approve KYC verification (admin function)
   */
  public async approveKyc(walletAddress: string, level: KycLevel): Promise<boolean> {
    try {
      // Get current data
      const currentData = this.getKycData(walletAddress);
      
      // Update with new data
      const updatedData: KycData = {
        ...currentData,
        status: KycStatus.APPROVED,
        level,
        approvedAt: Date.now(),
        rejectedAt: undefined,
        rejectionReason: undefined
      };
      
      // Save updated data
      this.saveKycData(walletAddress, updatedData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(`KYC verification approved at level ${level}`);
      return true;
    } catch (error) {
      console.error('Error approving KYC:', error);
      toast.error('Failed to approve KYC verification');
      return false;
    }
  }
  
  /**
   * Reject KYC verification (admin function)
   */
  public async rejectKyc(walletAddress: string, reason: string): Promise<boolean> {
    try {
      // Get current data
      const currentData = this.getKycData(walletAddress);
      
      // Update with new data
      const updatedData: KycData = {
        ...currentData,
        status: KycStatus.REJECTED,
        rejectedAt: Date.now(),
        rejectionReason: reason
      };
      
      // Save updated data
      this.saveKycData(walletAddress, updatedData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('KYC verification rejected');
      return true;
    } catch (error) {
      console.error('Error rejecting KYC:', error);
      toast.error('Failed to reject KYC verification');
      return false;
    }
  }
  
  /**
   * Check if user has completed KYC at the required level
   */
  public hasCompletedKyc(walletAddress: string, requiredLevel: KycLevel): boolean {
    const data = this.getKycData(walletAddress);
    return data.status === KycStatus.APPROVED && data.level >= requiredLevel;
  }
  
  /**
   * For demo purposes: Auto-approve KYC after a delay
   */
  public async autoApproveForDemo(walletAddress: string): Promise<void> {
    const data = this.getKycData(walletAddress);
    
    if (data.status === KycStatus.PENDING) {
      // Return a promise that resolves after the approval
      return new Promise((resolve) => {
        // Auto-approve after 3 seconds for demo purposes
        setTimeout(async () => {
          await this.approveKyc(walletAddress, KycLevel.BASIC);
          toast.success('Your KYC verification has been approved!');
          resolve();
        }, 3000);
      });
    }
  }
} 