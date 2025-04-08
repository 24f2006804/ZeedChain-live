'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useWeb3 } from '@/hooks/useWeb3';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { FileUpload } from '@/components/ui/file-upload';

interface KYCFormData {
  fullName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
  idType: 'passport' | 'drivingLicense' | 'nationalId';
  idNumber: string;
  idDocumentFront: File | null;
  idDocumentBack: File | null;
  selfie: File | null;
}

export default function AdvancedKycForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [kycStatus, setKycStatus] = useState<'pending' | 'approved' | 'rejected' | null>(null);
  const { web3, account, chainId } = useWeb3();
  
  const { 
    register, 
    handleSubmit, 
    setValue,
    formState: { errors },
    watch
  } = useForm<KYCFormData>({
    defaultValues: {
      idDocumentFront: null,
      idDocumentBack: null,
      selfie: null,
    }
  });

  const idType = watch('idType');

  const handleFileChange = (field: 'idDocumentFront' | 'idDocumentBack' | 'selfie') => (file: File | null) => {
    setValue(field, file);
  };

  const onSubmit = async (data: KYCFormData) => {
    if (!account) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Mock API call to a KYC service
      // In a real application, you would:
      // 1. Upload documents to a secure storage
      // 2. Send KYC data to your backend
      // 3. Interact with a smart contract to update KYC status on-chain
      
      console.log('Submitting KYC data:', {
        ...data,
        idDocumentFront: data.idDocumentFront ? data.idDocumentFront.name : null,
        idDocumentBack: data.idDocumentBack ? data.idDocumentBack.name : null,
        selfie: data.selfie ? data.selfie.name : null,
        walletAddress: account,
        chainId,
      });
      
      // Simulate blockchain interaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update KYC status
      setKycStatus('pending');
      
      toast.success('KYC submitted successfully. Your application is under review.');
      
      // In a real application, you would redirect to a success page or dashboard
      // Example: router.push('/kyc/success');
      
    } catch (error) {
      console.error('KYC submission error:', error);
      toast.error('Failed to submit KYC information. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (kycStatus === 'pending') {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold mb-4">KYC Verification Pending</h2>
        <p className="text-gray-600 mb-6">
          Your KYC application has been submitted and is currently under review.
          This process usually takes 1-3 business days.
        </p>
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => setKycStatus(null)}>
            Start a New Application
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">KYC Verification</h1>
        <p className="text-gray-600">
          Complete the form below to verify your identity and comply with regulatory requirements.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                {...register('fullName', { 
                  required: 'Full name is required',
                  minLength: { value: 3, message: 'Name must be at least 3 characters' }
                })}
              />
              {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                {...register('phoneNumber', { 
                  required: 'Phone number is required',
                  pattern: {
                    value: /^\+?[0-9\s\-\(\)]{10,20}$/,
                    message: 'Invalid phone number'
                  }
                })}
              />
              {errors.phoneNumber && <p className="text-red-500 text-sm">{errors.phoneNumber.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                {...register('dateOfBirth', { 
                  required: 'Date of birth is required',
                  validate: value => {
                    const date = new Date(value);
                    const today = new Date();
                    const age = today.getFullYear() - date.getFullYear();
                    return age >= 18 || 'You must be at least 18 years old';
                  }
                })}
              />
              {errors.dateOfBirth && <p className="text-red-500 text-sm">{errors.dateOfBirth.message}</p>}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">Address Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Street Address</Label>
              <Input
                id="address"
                {...register('address', { required: 'Address is required' })}
              />
              {errors.address && <p className="text-red-500 text-sm">{errors.address.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                {...register('city', { required: 'City is required' })}
              />
              {errors.city && <p className="text-red-500 text-sm">{errors.city.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                {...register('country', { required: 'Country is required' })}
              />
              {errors.country && <p className="text-red-500 text-sm">{errors.country.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                id="postalCode"
                {...register('postalCode', { required: 'Postal code is required' })}
              />
              {errors.postalCode && <p className="text-red-500 text-sm">{errors.postalCode.message}</p>}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">Identification</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="idType">ID Type</Label>
              <Select 
                onValueChange={(value) => setValue('idType', value as 'passport' | 'drivingLicense' | 'nationalId')}
                defaultValue=""
              >
                <SelectTrigger id="idType">
                  <SelectValue placeholder="Select ID type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="passport">Passport</SelectItem>
                  <SelectItem value="drivingLicense">Driving License</SelectItem>
                  <SelectItem value="nationalId">National ID</SelectItem>
                </SelectContent>
              </Select>
              {errors.idType && <p className="text-red-500 text-sm">{errors.idType.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="idNumber">ID Number</Label>
              <Input
                id="idNumber"
                {...register('idNumber', { required: 'ID number is required' })}
              />
              {errors.idNumber && <p className="text-red-500 text-sm">{errors.idNumber.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>ID Document (Front)</Label>
              <FileUpload 
                accept="image/*,.pdf" 
                onFileSelect={handleFileChange('idDocumentFront')}
                maxSizeMB={5}
              />
              {/* Assuming FileUpload component handles its own error display */}
            </div>

            {idType !== 'passport' && (
              <div className="space-y-2">
                <Label>ID Document (Back)</Label>
                <FileUpload 
                  accept="image/*,.pdf" 
                  onFileSelect={handleFileChange('idDocumentBack')}
                  maxSizeMB={5}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Selfie with ID</Label>
              <FileUpload 
                accept="image/*" 
                onFileSelect={handleFileChange('selfie')}
                maxSizeMB={5}
              />
              <p className="text-sm text-gray-500">
                Please provide a clear photo of yourself holding your ID document.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">Wallet Information</h2>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-md">
              <p className="font-medium">Connected Wallet Address:</p>
              <p className="font-mono text-sm break-all">
                {account ? account : 'No wallet connected'}
              </p>
            </div>
            
            {!account && (
              <p className="text-amber-600">
                Please connect your wallet to continue with KYC verification.
              </p>
            )}

            <p className="text-sm text-gray-500">
              This wallet address will be associated with your verified identity.
              Make sure you have control over this wallet.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            By submitting this form, you consent to the processing of your personal data for identity verification
            purposes in accordance with our Privacy Policy.
          </p>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting || !account}
          >
            {isSubmitting ? (
              <>
                <Spinner className="mr-2" />
                Processing...
              </>
            ) : (
              'Submit KYC Information'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}