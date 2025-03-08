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
  const { submitBasicKyc, loading, kycData, KycStatus, refreshKycData } = useKyc();
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
      console.error('Error submitting KYC:', error);
      toast.error('Failed to submit KYC information');
    } finally {
      setSubmitting(false);
    }
  };
  
  const selectedCountry = watch('country');
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Basic KYC Verification</CardTitle>
        <CardDescription>
          Please provide your basic information to verify your identity.
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
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              placeholder="John Doe"
              {...register('fullName')}
              disabled={isPending || submitting}
            />
            {errors.fullName && (
              <p className="text-red-500 text-sm">{errors.fullName.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="john.doe@example.com"
              {...register('email')}
              disabled={isPending || submitting}
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="country">Country of Residence</Label>
            <Select
              value={selectedCountry}
              onValueChange={(value) => setValue('country', value)}
              disabled={isPending || submitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.value} value={country.value}>
                    {country.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.country && (
              <p className="text-red-500 text-sm">{errors.country.message}</p>
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
          Your information is securely stored and will only be used for verification purposes.
        </p>
      </CardFooter>
    </Card>
  );
}; 