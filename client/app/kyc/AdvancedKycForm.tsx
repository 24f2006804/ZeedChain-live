import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useKyc } from '@/hooks/useKyc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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
  const { submitAdvancedKyc, loading, kycData, KycStatus } = useKyc();
  const [submitting, setSubmitting] = useState(false);
  
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
        data.idDocument,
        data.addressDocument,
        data.selfieImage
      );
      
      if (success) {
        toast.success('Advanced KYC information submitted successfully');
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
      // For this demo, we'll just use a fake URL
      const fakeUrl = `file://${field}_${Date.now()}_${file.name}`;
      setValue(field, fakeUrl);
    }
  };
  
  return (
    <Card className="w-full max-w-md mx-auto bg-black border-violet-900 shadow-lg shadow-violet-900/20 text-gray-200">
      <CardHeader className="border-b border-violet-900/50">
        <CardTitle className="text-white">Advanced KYC Verification</CardTitle>
        <CardDescription className="text-gray-400">
          Please provide additional information to complete your verification.
          {isRejected && (
            <p className="text-red-400 mt-2">
              Your previous submission was rejected: {kycData?.rejectionReason}
            </p>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="idType" className="text-gray-300">ID Type</Label>
            <Select
              value={selectedIdType}
              onValueChange={(value) => setValue('idType', value)}
              disabled={isPending || submitting}
            >
              <SelectTrigger className="bg-gray-900 border-violet-800 text-white focus:ring-violet-600">
                <SelectValue placeholder="Select ID type" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-violet-800 text-white">
                {idTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value} className="hover:bg-violet-900 focus:bg-violet-900">
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.idType && (
              <p className="text-red-400 text-sm">{errors.idType.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="idNumber" className="text-gray-300">ID Number</Label>
            <Input
              id="idNumber"
              placeholder="Enter your ID number"
              {...register('idNumber')}
              disabled={isPending || submitting}
              className="bg-gray-900 border-violet-800 text-white placeholder:text-gray-500 focus:border-violet-600 focus:ring-violet-600"
            />
            {errors.idNumber && (
              <p className="text-red-400 text-sm">{errors.idNumber.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="idExpiry" className="text-gray-300">ID Expiry Date</Label>
            <Input
              id="idExpiry"
              type="date"
              {...register('idExpiry')}
              disabled={isPending || submitting}
              className="bg-gray-900 border-violet-800 text-white focus:border-violet-600 focus:ring-violet-600"
            />
            {errors.idExpiry && (
              <p className="text-red-400 text-sm">{errors.idExpiry.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="idDocument" className="text-gray-300">Upload ID Document</Label>
            <Input
              id="idDocument"
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileUpload('idDocument')}
              disabled={isPending || submitting}
              className="bg-gray-900 border-violet-800 text-white file:bg-violet-700 file:text-white file:border-0 file:mr-4 file:px-4 file:py-2 file:rounded hover:file:bg-violet-600"
            />
            {errors.idDocument && (
              <p className="text-red-400 text-sm">{errors.idDocument.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="addressDocument" className="text-gray-300">Upload Proof of Address</Label>
            <Input
              id="addressDocument"
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileUpload('addressDocument')}
              disabled={isPending || submitting}
              className="bg-gray-900 border-violet-800 text-white file:bg-violet-700 file:text-white file:border-0 file:mr-4 file:px-4 file:py-2 file:rounded hover:file:bg-violet-600"
            />
            {errors.addressDocument && (
              <p className="text-red-400 text-sm">{errors.addressDocument.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="selfieImage" className="text-gray-300">Upload Selfie</Label>
            <Input
              id="selfieImage"
              type="file"
              accept="image/*"
              onChange={handleFileUpload('selfieImage')}
              disabled={isPending || submitting}
              className="bg-gray-900 border-violet-800 text-white file:bg-violet-700 file:text-white file:border-0 file:mr-4 file:px-4 file:py-2 file:rounded hover:file:bg-violet-600"
            />
            {errors.selfieImage && (
              <p className="text-red-400 text-sm">{errors.selfieImage.message}</p>
            )}
          </div>
          
          <Button
            type="submit"
            className="w-full bg-violet-700 hover:bg-violet-600 text-white"
            disabled={isPending || submitting || loading}
          >
            {submitting ? 'Submitting...' : isPending ? 'Pending Approval' : 'Submit'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="border-t border-violet-900/50 pt-4 flex justify-between">
        <p className="text-sm text-gray-500">
          Your documents are securely stored and will only be used for verification purposes.
        </p>
      </CardFooter>
    </Card>
  );
};