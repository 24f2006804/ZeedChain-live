import { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AdvancedKycForm from '@/components/kyc';

export const metadata: Metadata = {
  title: 'KYC Verification - ZeedChain',
  description: 'Complete your KYC verification to start investing in startups',
};

export default function KYCPage() {
  // Check if user is authenticated
  const cookieStore = cookies();
  const authToken = cookieStore.get('auth-token');
  
  // If user is not authenticated, redirect to login page
  if (!authToken) {
    redirect('/login?redirect=/kyc');
  }
  
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">KYC Verification</h1>
        <p className="text-gray-600 mb-8">
          Complete your KYC verification to access all investment opportunities on ZeedChain.
          This is a required step before you can invest in any startup projects.
        </p>
        <div className="bg-white rounded-lg shadow-md p-6">
          <AdvancedKycForm />
        </div>
      </div>
    </div>
  );
}

