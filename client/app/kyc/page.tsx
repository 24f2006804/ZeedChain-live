"use client"

import { useState } from 'react';
import { useWeb3 } from '@/hooks/useWeb3';
import { useKyc } from '@/hooks/useKyc';
import { KycStatus } from '@/components/kyc/KycStatus';
import { BasicKycForm } from '@/components/kyc/BasicKycForm';
import { AdvancedKycForm } from '@/components/kyc/AdvancedKycForm';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, AlertTriangle } from 'lucide-react';

enum KycTab {
  STATUS = 'status',
  BASIC = 'basic',
  ADVANCED = 'advanced'
}

export default function KycPage() {
  const { isConnected, connectWallet } = useWeb3();
  const { kycData, KycLevel } = useKyc();
  const [activeTab, setActiveTab] = useState<KycTab>(KycTab.STATUS);
  
  const handleStartBasicKyc = () => {
    setActiveTab(KycTab.BASIC);
  };
  
  const handleStartAdvancedKyc = () => {
    setActiveTab(KycTab.ADVANCED);
  };
  
  if (!isConnected) {
    return (
      <div className="min-h-screen p-10 flex flex-col items-center justify-center">
        <Shield className="h-16 w-16 text-blue-500 mb-4" />
        <h1 className="text-2xl font-bold mb-4">Connect Wallet to Access KYC</h1>
        <p className="text-gray-500 mb-6 text-center max-w-md">
          You need to connect your wallet to access the KYC verification process.
          KYC is required to invest in startups on our platform.
        </p>
        <Button onClick={connectWallet}>Connect Wallet</Button>
      </div>
    );
  }
  
  const isAdvancedDisabled = !kycData || kycData.level < KycLevel.BASIC;
  
  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">KYC Verification</h1>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Complete your KYC verification to unlock full access to investment opportunities.
            This process helps us comply with regulations and protect our users.
          </p>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8 flex items-start">
          <AlertTriangle className="h-5 w-5 text-yellow-500 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-yellow-800">Important Information</h3>
            <p className="text-yellow-700 text-sm">
              All information provided during KYC verification must be accurate and up-to-date.
              Providing false information may result in account suspension. Your data is securely
              stored and only used for verification purposes.
            </p>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as KycTab)} className="w-full">
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value={KycTab.STATUS}>Status</TabsTrigger>
            <TabsTrigger value={KycTab.BASIC}>Basic KYC</TabsTrigger>
            <TabsTrigger value={KycTab.ADVANCED} disabled={isAdvancedDisabled}>
              Advanced KYC
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value={KycTab.STATUS}>
            <KycStatus 
              onStartBasicKyc={handleStartBasicKyc}
              onStartAdvancedKyc={handleStartAdvancedKyc}
            />
          </TabsContent>
          
          <TabsContent value={KycTab.BASIC}>
            <BasicKycForm />
          </TabsContent>
          
          <TabsContent value={KycTab.ADVANCED}>
            <AdvancedKycForm />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 