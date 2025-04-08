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
  selfieWithId?: string;
  selfieWithIdTimestamp?: number;
  submittedAt?: number;
  approvedAt?: number;
  rejectedAt?: number;
  rejectionReason?: string;
}

// Image validation constants
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const VALID_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

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
   * Validate image data
   * @param imageData base64 encoded image string
   * @returns boolean indicating if the image is valid
   */
  private validateImage(imageData: string): boolean {
    // Check if the image is a valid base64 string
    if (!imageData.startsWith('data:image/')) {
      return false;
    }

    // Extract the image type and content
    const [header, content] = imageData.split(',');
    const imageType = header.split(';')[0].split(':')[1];

    // Validate image type
    if (!VALID_IMAGE_TYPES.includes(imageType)) {
      return false;
    }

    // Calculate size (base64 to binary)
    const binarySize = atob(content).length;
    if (binarySize > MAX_IMAGE_SIZE) {
      return false;
    }

    return true;
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
    selfieImage: string,
    selfieWithId: string
  ): Promise<boolean> {
    try {
      // Get current data
      const currentData = this.getKycData(walletAddress);
      
      // Check if basic KYC is completed
      if (currentData.level < KycLevel.BASIC) {
        toast.error('Please complete basic KYC verification first');
        return false;
      }
      
      // Validate selfie with ID
      if (!this.validateImage(selfieWithId)) {
        toast.error('Invalid selfie image format or size');
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
        selfieWithId,
        selfieWithIdTimestamp: Date.now(),
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
      // For advanced KYC, check if all required fields are present
      if (data.level === KycLevel.BASIC && 
          data.idType && 
          data.idNumber && 
          data.idExpiry && 
          data.idDocument && 
          data.addressDocument && 
          data.selfieImage && 
          data.selfieWithId) {
        // Auto-approve advanced KYC after 3 seconds for demo purposes
        setTimeout(async () => {
          await this.approveKyc(walletAddress, KycLevel.ADVANCED);
          toast.success('Your Advanced KYC verification has been approved!');
        }, 3000);
      } else if (data.fullName && data.email && data.country) {
        // Auto-approve basic KYC after 3 seconds for demo purposes
        setTimeout(async () => {
          await this.approveKyc(walletAddress, KycLevel.BASIC);
          toast.success('Your Basic KYC verification has been approved!');
        }, 3000);
      }
    }
  }
} 