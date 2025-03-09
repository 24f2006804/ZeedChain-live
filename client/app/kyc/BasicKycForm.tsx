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
  fullName: z.string().min(3, 'Full name must be at least 3 characters'),
  email: z.string().email('Please enter a valid email address'),
  country: z.string().min(2, 'Please select a country')
});

type FormData = z.infer<typeof formSchema>;

// Country options
const countries = [
  { value: 'us', label: 'United States' },
  { value: 'ca', label: 'Canada' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'au', label: 'Australia' },
  { value: 'de', label: 'Germany' },
  { value: 'fr', label: 'France' },
  { value: 'jp', label: 'Japan' },
  { value: 'in', label: 'India' },
  { value: 'br', label: 'Brazil' },
  { value: 'za', label: 'South Africa' }
];

export const BasicKycForm = () => {
  const { submitBasicKyc, loading, kycData, KycStatus } = useKyc();
  const [submitting, setSubmitting] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: kycData?.fullName || '',
      email: kycData?.email || '',
      country: kycData?.country || ''
    }
  });
  
  const isPending = kycData?.status === KycStatus.PENDING;
  const isRejected = kycData?.status === KycStatus.REJECTED;
  
  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      const success = await submitBasicKyc(
        data.fullName,
        data.email,
        data.country
      );
      
      if (success) {
        toast.success('KYC information submitted successfully');
      }
    } catch (error) {
      console.error('Error submitting KYC:', error);
      toast.error('Failed to submit KYC information');
    } finally {
      setSubmitting(false);
    }
  };
  
  const selectedCountry = watch('country');
  
  return (
    <Card className="w-full max-w-md mx-auto bg-black border-violet-900 shadow-lg shadow-violet-900/20 text-gray-200">
      <CardHeader className="border-b border-violet-900/50">
        <CardTitle className="text-white">Basic KYC Verification</CardTitle>
        <CardDescription className="text-gray-400">
          Please provide your basic information to verify your identity.
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
            <Label htmlFor="fullName" className="text-gray-300">Full Name</Label>
            <Input
              id="fullName"
              placeholder="John Doe"
              {...register('fullName')}
              disabled={isPending || submitting}
              className="bg-gray-900 border-violet-800 text-white placeholder:text-gray-500 focus:border-violet-600 focus:ring-violet-600"
            />
            {errors.fullName && (
              <p className="text-red-400 text-sm">{errors.fullName.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-300">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="john.doe@example.com"
              {...register('email')}
              disabled={isPending || submitting}
              className="bg-gray-900 border-violet-800 text-white placeholder:text-gray-500 focus:border-violet-600 focus:ring-violet-600"
            />
            {errors.email && (
              <p className="text-red-400 text-sm">{errors.email.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="country" className="text-gray-300">Country of Residence</Label>
            <Select
              value={selectedCountry}
              onValueChange={(value) => setValue('country', value)}
              disabled={isPending || submitting}
            >
              <SelectTrigger className="bg-gray-900 border-violet-800 text-white focus:ring-violet-600">
                <SelectValue placeholder="Select a country" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-violet-800 text-white">
                {countries.map((country) => (
                  <SelectItem key={country.value} value={country.value} className="hover:bg-violet-900 focus:bg-violet-900">
                    {country.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.country && (
              <p className="text-red-400 text-sm">{errors.country.message}</p>
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
          Your information is securely stored and will only be used for verification purposes.
        </p>
      </CardFooter>
    </Card>
  );
};