'use client';

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
import { FileUpload } from '@/components/ui/file-upload';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WebcamCapture } from '@/components/ui/webcam-capture';
import { toast } from 'sonner';
import { Check, AlertCircle, Camera, Upload, FileText } from 'lucide-react';

// Form validation schema
const formSchema = z.object({
    idType: z.enum(['passport', 'driving_license', 'national_id']),
    idNumber: z.string().min(3, 'ID number must be at least 3 characters'),
    idExpiry: z.string().min(1, 'Please select expiry date'),
    idDocument: z.any().refine((file) => file instanceof File, 'Please upload your ID document'),
    addressDocument: z.any().refine((file) => file instanceof File, 'Please upload proof of address'),
    selfieImage: z.any().refine((file) => file instanceof File, 'Please provide a selfie'),
});

type FormValues = z.infer<typeof formSchema>;

export default function AdvancedKycForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { submitKyc, isLoading, kycStatus } = useKyc();
    const [captureMode, setCaptureMode] = useState<'upload' | 'webcam'>('upload');
    
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            idType: 'passport',
            idNumber: '',
            idExpiry: '',
            idDocument: null,
            addressDocument: null,
            selfieImage: null,
        },
    });

    const { register, handleSubmit, formState: { errors }, setValue, watch } = form;
    
    const onSubmit = async (data: FormValues) => {
        try {
            setIsSubmitting(true);
            await submitKyc(data);
            toast.success('KYC verification submitted successfully');
        } catch (error) {
            console.error('KYC submission failed:', error);
            toast.error('Failed to submit KYC verification');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileUpload = (fieldName: keyof FormValues) => (file: File | null) => {
        setValue(fieldName, file, { 
            shouldValidate: true,
            shouldDirty: true
        });
    };

    const handleWebcamCapture = (imageBlobUrl: string) => {
        fetch(imageBlobUrl)
            .then(res => res.blob())
            .then(blob => {
                const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' });
                setValue('selfieImage', file, { 
                    shouldValidate: true,
                    shouldDirty: true
                });
                setCaptureMode('upload');
            })
            .catch(error => {
                console.error('Error converting blob URL to file:', error);
                toast.error('Failed to process captured image');
            });
    };

    if (kycStatus === 'verified') {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Verification Complete</CardTitle>
                    <CardDescription>Your identity has been verified successfully.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Alert>
                        <Check className="h-4 w-4" />
                        <AlertTitle>Verification Successful</AlertTitle>
                        <AlertDescription>
                            You now have full access to all platform features.
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    if (kycStatus === 'pending') {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Verification In Progress</CardTitle>
                    <CardDescription>Your KYC submission is currently being reviewed.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Verification Pending</AlertTitle>
                        <AlertDescription>
                            We are currently reviewing your documents. This process typically takes 1-2 business days.
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>KYC Verification</CardTitle>
                <CardDescription>
                    Complete your identity verification to unlock platform features
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-6">
                    {/* ID Information Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Identity Information</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="idType">ID Type</Label>
                                <Select 
                                    defaultValue={form.getValues().idType}
                                    onValueChange={(value: any) => setValue('idType', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select ID type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="passport">Passport</SelectItem>
                                        <SelectItem value="driving_license">Driving License</SelectItem>
                                        <SelectItem value="national_id">National ID</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.idType && (
                                    <p className="text-sm text-red-500">{errors.idType.message}</p>
                                )}
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="idNumber">ID Number</Label>
                                <Input
                                    id="idNumber"
                                    placeholder="Enter your ID number"
                                    {...register('idNumber')}
                                />
                                {errors.idNumber && (
                                    <p className="text-sm text-red-500">{errors.idNumber.message}</p>
                                )}
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="idExpiry">Expiry Date</Label>
                                <Input
                                    id="idExpiry"
                                    type="date"
                                    {...register('idExpiry')}
                                />
                                {errors.idExpiry && (
                                    <p className="text-sm text-red-500">{errors.idExpiry.message}</p>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    {/* Document Upload Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Document Upload</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>ID Document</Label>
                                <div className="border rounded-md p-4">
                                    <FileUpload
                                        accept=".jpg,.jpeg,.png,.pdf"
                                        onFileSelect={handleFileUpload('idDocument')}
                                        maxSizeMB={5}
                                        icon={<FileText className="h-6 w-6" />}
                                        label="Upload ID Document"
                                        description="JPG, PNG or PDF, max 5MB"
                                    />
                                </div>
                                {errors.idDocument && (
                                    <p className="text-sm text-red-500">{errors.idDocument.message}</p>
                                )}
                                {watch('idDocument') && (
                                    <p className="text-sm text-green-500">
                                        ✓ {(watch('idDocument') as File).name} uploaded
                                    </p>
                                )}
                            </div>
                            
                            <div className="space-y-2">
                                <Label>Proof of Address</Label>
                                <div className="border rounded-md p-4">
                                    <FileUpload
                                        accept=".jpg,.jpeg,.png,.pdf"
                                        onFileSelect={handleFileUpload('addressDocument')}
                                        maxSizeMB={5}
                                        icon={<FileText className="h-6 w-6" />}
                                        label="Upload Proof of Address"
                                        description="Utility bill or bank statement, max 5MB"
                                    />
                                </div>
                                {errors.addressDocument && (
                                    <p className="text-sm text-red-500">{errors.addressDocument.message}</p>
                                )}
                                {watch('addressDocument') && (
                                    <p className="text-sm text-green-500">
                                        ✓ {(watch('addressDocument') as File).name} uploaded
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    {/* Selfie Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Selfie Verification</h3>
                        
                        <Tabs defaultValue="upload" onValueChange={(value) => setCaptureMode(value as 'upload' | 'webcam')}>
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="upload">
                                    <Upload className="h-4 w-4 mr-2" />
                                    Upload Photo
                                </TabsTrigger>
                                <TabsTrigger value="webcam">
                                    <Camera className="h-4 w-4 mr-2" />
                                    Take Photo
                                </TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="upload" className="space-y-4">
                                <div className="border rounded-md p-4">
                                    <FileUpload
                                        accept=".jpg,.jpeg,.png"
                                        onFileSelect={handleFileUpload('selfieImage')}
                                        maxSizeMB={5}
                                        icon={<Camera className="h-6 w-6" />}
                                        label="Upload Selfie"
                                        description="Clear photo of your face, JPG or PNG, max 5MB"
                                    />
                                </div>
                            </TabsContent>
                            
                            <TabsContent value="webcam">
                                <div className="border rounded-md p-4">
                                    <WebcamCapture
                                        onCapture={handleWebcamCapture}
                                        width={400}
                                        height={300}
                                    />
                                </div>
                            </TabsContent>
                        </Tabs>
                        
                        {errors.selfieImage && (
                            <p className="text-sm text-red-500">{errors.selfieImage.message}</p>
                        )}
                        
                        {watch('selfieImage') && (
                            <p className="text-sm text-green-500">
                                ✓ Selfie image captured
                            </p>
                        )}
                    </div>
                    
                    <Alert className="bg-amber-50 border-amber-200">
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                        <AlertTitle>Important</AlertTitle>
                        <AlertDescription className="text-sm text-amber-700">
                            Ensure all documents are clear, uncropped, and all information is visible. 
                            Blurry or incomplete documents will delay your verification.
                        </AlertDescription>
                    </Alert>
                </CardContent>
                
                <CardFooter className="flex flex-col sm:flex-row gap-4 justify-end">
                    <Button
                        type="submit"
                        disabled={isSubmitting || isLoading}
                        className="w-full sm:w-auto"
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Verification'}
                    </Button>
                    
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full sm:w-auto"
                        onClick={() => window.history.back()}
                    >
                        Cancel
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}

'use client';

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
import { FileUpload } from '@/components/ui/file-upload';
import { WebcamCapture } from '@/components/ui/webcam-capture';
import { toast } from 'sonner';
import { AlertCircle, Camera, Check, FileText, Upload } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from 'date-fns';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const formSchema = z.object({
  idType: z.enum(['passport', 'driving_license', 'national_id'], {
    required_error: 'Please select an ID type'
  }),
  idNumber: z.string().min(3, 'ID number must be at least 3 characters'),
  idExpiry: z.string().min(1, 'Please select expiry date'),
  idDocument: z.any().refine((file) => file instanceof File, 'Please upload your ID document'),
  addressDocument: z.any().refine((file) => file instanceof File, 'Please upload proof of address'),
  selfieImage: z.any().refine((file) => file instanceof File, 'Please provide a selfie'),
  selfieWithId: z.any().refine((file) => file instanceof File, 'Please take a photo with your ID')
});

type FormValues = z.infer<typeof formSchema>;

export function AdvancedKycForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWebcam, setShowWebcam] = useState(false);
  const [showSelfieWebcam, setShowSelfieWebcam] = useState(false);
  const [showIdWebcam, setShowIdWebcam] = useState(false);
  const [date, setDate] = useState<Date | undefined>();
  const { submitKyc, loading, isPending, kycStatus } = useKyc();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      idType: 'passport',
      idNumber: '',
      idExpiry: '',
      idDocument: null,
      addressDocument: null,
      selfieImage: null,
      selfieWithId: null
    }
  });

  const { register, handleSubmit, formState: { errors }, setValue, watch } = form;
  const idDocument = watch('idDocument');
  const addressDocument = watch('addressDocument');
  const selfieImage = watch('selfieImage');
  const selfieWithId = watch('selfieWithId');

  const handleFileSelect = (name: keyof FormValues) => (file: File | null) => {
    setValue(name, file, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const handleSelfieCapture = (dataUrl: string) => {
    // Convert data URL to File
    fetch(dataUrl)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });
        setValue('selfieImage', file, {
          shouldValidate: true,
          shouldDirty: true,
        });
        setShowSelfieWebcam(false);
      });
  };

  const handleIdCapture = (dataUrl: string) => {
    // Convert data URL to File
    fetch(dataUrl)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], "selfie_with_id.jpg", { type: "image/jpeg" });
        setValue('selfieWithId', file, {
          shouldValidate: true,
          shouldDirty: true,
        });
        setShowIdWebcam(false);
      });
  };

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      
      // Create form data to handle file uploads
      const formData = new FormData();
      formData.append('idType', data.idType);
      formData.append('idNumber', data.idNumber);
      formData.append('idExpiry', data.idExpiry);
      formData.append('idDocument', data.idDocument);
      formData.append('addressDocument', data.addressDocument);
      formData.append('selfieImage', data.selfieImage);
      formData.append('selfieWithId', data.selfieWithId);
      
      await submitKyc(formData);
      toast.success('KYC submitted successfully. Your verification is now pending review.');
    } catch (error) {
      console.error('KYC submission failed:', error);
      toast.error('Failed to submit KYC information. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If KYC is already verified, show success message
  if (kycStatus === 'verified') {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <Check className="h-6 w-6" />
            Verification Complete
          </CardTitle>
          <CardDescription>
            Your identity has been successfully verified. You now have full access to all platform features.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="bg-green-50 border-green-200">
            <Check className="h-5 w-5 text-green-600" />
            <AlertTitle>Verification Successful</AlertTitle>
            <AlertDescription>
              Your KYC verification has been approved. Thank you for completing the verification process.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter>
          <Button onClick={() => window.history.back()}>
            Return to Previous Page
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // If KYC is pending, show pending message
  if (kycStatus === 'pending') {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-amber-600">Verification Pending</CardTitle>
          <CardDescription>
            Your KYC verification is currently under review. This usually takes 24-48 hours.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="bg-amber-50 border-amber-200">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <AlertTitle>Verification In Progress</AlertTitle>
            <AlertDescription>
              Your documents have been submitted and are being reviewed by our compliance team.
              We'll notify you once the verification is complete.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={() => window.history.back()}>
            Return to Previous Page
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Identity Verification (KYC)</CardTitle>
        <CardDescription>
          Complete the verification process to access all platform features. Your information is securely encrypted and protected.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          {/* ID Document Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Identity Document Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="idType">ID Type</Label>
                <Select 
                  defaultValue={form.getValues().idType} 
                  onValueChange={(value) => setValue('idType', value as 'passport' | 'driving_license' | 'national_id')}
                >
                  <SelectTrigger id="idType">
                    <SelectValue placeholder="Select ID Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="passport">Passport</SelectItem>
                    <SelectItem value="driving_license">Driving License</SelectItem>
                    <SelectItem value="national_id">National ID Card</SelectItem>
                  </SelectContent>
                </Select>
                {errors.idType && (
                  <p className="text-sm text-red-500">{errors.idType.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="idNumber">ID Number</Label>
                <Input
                  id="idNumber"
                  {...register('idNumber')}
                  placeholder="Enter your ID number"
                />
                {errors.idNumber && (
                  <p className="text-sm text-red-500">{errors.idNumber.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="idExpiry">Expiry Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    {date ? format(date, 'PPP') : <span>Select expiry date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(date) => {
                      setDate(date);
                      if (date) {
                        setValue('idExpiry', format(date, 'yyyy-MM-dd'), { 
                          shouldValidate: true 
                        });
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.idExpiry && (
                <p className="text-sm text-red-500">{errors.idExpiry.message}</p>
              )}
            </div>
          </div>

          {/* Document Upload Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Document Upload</h3>
            
            <div className="space-y-2">
              <Label htmlFor="idDocument">Upload ID Document</Label>
              <div className="mt-1 flex flex-col items-center space-y-2 rounded-md border border-gray-300 p-6">
                {idDocument ? (
                  <div className="flex items-center space-x-2">
                    <FileText className="h-6 w-6 text-blue-500" />
                    <span className="text-sm text-gray-700">
                      {idDocument.name}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setValue('idDocument', null)}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload className="h-10 w-10 text-gray-400 mb-2" />
                    <FileUpload
                      accept=".jpg,.jpeg,.png,.pdf"
                      onFileSelect={handleFileSelect('idDocument')}
                      maxSizeMB={5}
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      JPG, PNG or PDF, max 5MB
                    </p>
                  </div>
                )}
              </div>
              {errors.idDocument && (
                <p className="text-sm text-red-500">{errors.idDocument.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="addressDocument">Upload Proof of Address</Label>
              <div className="mt-1 flex flex-col items-center space-y-2 rounded-md border border-gray-300 p-6">
                {addressDocument ? (
                  <div className="flex items-center space-x-2">
                    <FileText className="h-6 w-6 text-blue-500" />
                    <span className="text-sm text-gray-700">
                      {addressDocument.name}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setValue('addressDocument', null)}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload className="h-10 w-10 text-gray-400 mb-2" />
                    <FileUpload
                      accept=".jpg,.jpeg,.png,.pdf"
                      onFileSelect={handleFileSelect('addressDocument')}
                      maxSizeMB={5}
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Recent utility bill, bank statement, etc. (JPG, PNG or PDF, max 5MB)
                    </p>
                  </div>
                )}
              </div>
              {errors.addressDocument && (
                <p className="text-sm text-red-500">{errors.addressDocument.message}</p>
              )}
            </div>
          </div>

          {/* Selfie Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Selfie Verification</h3>
            
            <div className="space-y-2">
              <Label>Selfie Photo</Label>
              <Tabs defaultValue="upload" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upload">Upload</TabsTrigger>
                  <TabsTrigger value="webcam">Use Webcam</TabsTrigger>
                </TabsList>
                <TabsContent value="upload" className="mt-2">
                  <div className="mt-1 flex flex-col items-center space-y-2 rounded-md border border-gray-300 p-6">
                    {selfieImage && !showSelfieWebcam ? (
                      <div className="flex items-center space-x-2">
                        <FileText className="h-6 w-6 text-blue

'use client';

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
import { WebcamKycForm } from './WebcamKycForm';

// Form validation schema
const formSchema = z.object({
  idType: z.string().min(1, 'Please select an ID type'),
  idNumber: z.string().min(3, 'ID number must be at least 3 characters'),
  idExpiry: z.string().min(10, 'Please enter a valid expiry date'),
  idDocument: z.string().min(1, 'Please upload your ID document'),
  addressDocument: z.string().min(1, 'Please upload your proof of address'),
  selfieImage: z.string().min(1, 'Please upload your selfie'),
  selfieWithId: z.string().min(1, 'Please capture a photo with your ID')
});

type FormValues = z.infer<typeof formSchema>;

// ID type options
const idTypes = [
  { value: 'passport', label: 'Passport' },
  { value: 'driving_license', label: 'Driving License' },
  { value: 'national_id', label: 'National ID Card' }
];

export function AdvancedKycForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWebcam, setShowWebcam] = useState(false);
  const { submitAdvancedKyc, loading, kycData, KycStatus } = useKyc();
  
  const isPending = kycData?.status === KycStatus.PENDING;
  const isRej
