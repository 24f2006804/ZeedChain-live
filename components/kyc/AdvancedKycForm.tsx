import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useKyc } from '../../hooks/useKyc';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { toast } from 'sonner';

// Form validation schema
const formSchema = z.object({
  idType: z.string().min(1, 'Please select an ID type'),
  idNumber: z.string().min(3, 'ID number must be at least 3 characters'),
  idExpiry: z.string().min(10, 'Please enter a valid expiry date'),
  idDocument: z.string().min(1, 'Please upload your ID document'),
  addressDocument: z.string().min(1, 'Please upload your proof of address'),
  selfieImage: z.string().min(1, 'Please upload your selfie')
});

type FormData = z.infer<typeof formSchema>;

// ID type options
const idTypes = [
  { value: 'passport', label: 'Passport' },
  { value: 'driving_license', label: 'Driving License' },
  { value: 'national_id', label: 'National ID Card' }
];

export const AdvancedKycForm = () => {
  const { submitAdvancedKyc, loading, kycData, KycStatus, refreshKycData } = useKyc();
  const [submitting, setSubmitting] = useState(false);
  const [files, setFiles] = useState<Record<string, string>>({
    idDocument: '',
    addressDocument: '',
    selfieImage: ''
  });
  
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      idType: kycData?.idType || '',
      idNumber: kycData?.idNumber || '',
      idExpiry: kycData?.idExpiry || '',
      idDocument: kycData?.idDocument || '',
      addressDocument: kycData?.addressDocument || '',
      selfieImage: kycData?.selfieImage || ''
    }
  });
  
  const isPending = kycData?.status === KycStatus.PENDING;
  const isRejected = kycData?.status === KycStatus.REJECTED;
  
  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      const success = await submitAdvancedKyc(
        data.idType,
        data.idNumber,
        data.idExpiry,
        files.idDocument,
        files.addressDocument,
        files.selfieImage
      );
      
      if (success) {
        toast.success('Advanced KYC information submitted successfully');
        
        // Set up a timer to refresh the KYC data periodically
        const refreshInterval = setInterval(() => {
          refreshKycData();
          
          // Check if KYC is approved and clear the interval if it is
          if (kycData?.status === KycStatus.APPROVED) {
            clearInterval(refreshInterval);
          }
        }, 3000);
        
        // Clear the interval after 30 seconds to avoid infinite refreshing
        setTimeout(() => {
          clearInterval(refreshInterval);
        }, 30000);
      }
    } catch (error) {
      console.error('Error submitting advanced KYC:', error);
      toast.error('Failed to submit advanced KYC information');
    } finally {
      setSubmitting(false);
    }
  };
  
  const selectedIdType = watch('idType');
  
  // Helper function to handle file uploads
  const handleFileUpload = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you would upload the file to a server and get a URL
      // For demo purposes, we'll just use a fake URL
      const fakeUrl = `https://example.com/uploads/${field}_${Date.now()}.jpg`;
      
      // Update the form value
      setValue(field, fakeUrl);
      
      // Also update our files state for submission
      setFiles(prev => ({
        ...prev,
        [field]: fakeUrl
      }));
    }
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Advanced KYC Verification</CardTitle>
        <CardDescription>
          Please provide additional information to complete your verification.
          {isRejected && (
            <p className="text-red-500 mt-2">
              Your previous submission was rejected: {kycData?.rejectionReason}
            </p>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="idType">ID Type</Label>
            <Select
              value={selectedIdType}
              onValueChange={(value) => setValue('idType', value)}
              disabled={isPending || submitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select ID type" />
              </SelectTrigger>
              <SelectContent>
                {idTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.idType && (
              <p className="text-red-500 text-sm">{errors.idType.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="idNumber">ID Number</Label>
            <Input
              id="idNumber"
              placeholder="Enter your ID number"
              {...register('idNumber')}
              disabled={isPending || submitting}
            />
            {errors.idNumber && (
              <p className="text-red-500 text-sm">{errors.idNumber.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="idExpiry">ID Expiry Date</Label>
            <Input
              id="idExpiry"
              type="date"
              {...register('idExpiry')}
              disabled={isPending || submitting}
            />
            {errors.idExpiry && (
              <p className="text-red-500 text-sm">{errors.idExpiry.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="idDocument">Upload ID Document</Label>
            <Input
              id="idDocument"
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileUpload('idDocument')}
              disabled={isPending || submitting}
            />
            {errors.idDocument && (
              <p className="text-red-500 text-sm">{errors.idDocument.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="addressDocument">Upload Proof of Address</Label>
            <Input
              id="addressDocument"
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileUpload('addressDocument')}
              disabled={isPending || submitting}
            />
            {errors.addressDocument && (
              <p className="text-red-500 text-sm">{errors.addressDocument.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="selfieImage">Upload Selfie</Label>
            <Input
              id="selfieImage"
              type="file"
              accept="image/*"
              onChange={handleFileUpload('selfieImage')}
              disabled={isPending || submitting}
            />
            {errors.selfieImage && (
              <p className="text-red-500 text-sm">{errors.selfieImage.message}</p>
            )}
          </div>
          
          <Button
            type="submit"
            className="w-full"
            disabled={isPending || submitting || loading}
          >
            {submitting ? 'Submitting...' : isPending ? 'Pending Approval' : 'Submit'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <p className="text-sm text-gray-500">
          Your documents are securely stored and will only be used for verification purposes.
        </p>
      </CardFooter>
    </Card>
  );
}; 