import { useState, useEffect } from 'react';
import { useWeb3 } from '../hooks/useWeb3';
import { KycService, KycStatus, KycLevel, KycData } from '../services/KycService';

export const useKyc = () => {
  const { account, isConnected } = useWeb3();
  const [kycData, setKycData] = useState<KycData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Get KYC service instance
  const kycService = KycService.getInstance();
  
  // Load KYC data when account changes
  useEffect(() => {
    loadKycData();
  }, [account, isConnected]);
  
  // Function to load KYC data
  const loadKycData = () => {
    if (isConnected && account) {
      const data = kycService.getKycData(account);
      setKycData(data);
    } else {
      setKycData(null);
    }
    setLoading(false);
  };
  
  // Function to refresh KYC data
  const refreshKycData = () => {
    setLoading(true);
    loadKycData();
  };
  
  // Submit basic KYC verification
  const submitBasicKyc = async (
    fullName: string,
    email: string,
    country: string
  ): Promise<boolean> => {
    if (!account) return false;
    
    setLoading(true);
    try {
      const success = await kycService.submitBasicKyc(
        account,
        fullName,
        email,
        country
      );
      
      if (success) {
        // Refresh KYC data
        const updatedData = kycService.getKycData(account);
        setKycData(updatedData);
        
        // Auto-approve for demo purposes
        await kycService.autoApproveForDemo(account);
        
        // Refresh KYC data again after auto-approval
        const finalData = kycService.getKycData(account);
        setKycData(finalData);
      }
      
      return success;
    } finally {
      setLoading(false);
    }
  };
  
  // Submit advanced KYC verification
  const submitAdvancedKyc = async (
    idType: string,
    idNumber: string,
    idExpiry: string,
    idDocument: string,
    addressDocument: string,
    selfieImage: string
  ): Promise<boolean> => {
    if (!account) return false;
    
    setLoading(true);
    try {
      const success = await kycService.submitAdvancedKyc(
        account,
        idType,
        idNumber,
        idExpiry,
        idDocument,
        addressDocument,
        selfieImage
      );
      
      if (success) {
        // Refresh KYC data
        const updatedData = kycService.getKycData(account);
        setKycData(updatedData);
        
        // Auto-approve for demo purposes
        await kycService.autoApproveForDemo(account);
        
        // Refresh KYC data again after auto-approval
        const finalData = kycService.getKycData(account);
        setKycData(finalData);
      }
      
      return success;
    } finally {
      setLoading(false);
    }
  };
  
  // Check if user has completed KYC at the required level
  const hasCompletedKyc = (requiredLevel: KycLevel = KycLevel.BASIC): boolean => {
    if (!account || !kycData) return false;
    return kycData.status === KycStatus.APPROVED && kycData.level >= requiredLevel;
  };
  
  // Get KYC status text
  const getKycStatusText = (): string => {
    if (!kycData) return 'Not Started';
    
    switch (kycData.status) {
      case KycStatus.NOT_STARTED:
        return 'Not Started';
      case KycStatus.PENDING:
        return 'Pending Approval';
      case KycStatus.APPROVED:
        return `Approved (Level ${kycData.level})`;
      case KycStatus.REJECTED:
        return `Rejected: ${kycData.rejectionReason || 'No reason provided'}`;
      default:
        return 'Unknown';
    }
  };
  
  return {
    kycData,
    loading,
    submitBasicKyc,
    submitAdvancedKyc,
    hasCompletedKyc,
    getKycStatusText,
    refreshKycData,
    KycStatus,
    KycLevel
  };
}; 