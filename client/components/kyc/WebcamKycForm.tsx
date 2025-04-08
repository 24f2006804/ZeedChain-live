'use client';

import { useRef, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

const webcamSchema = z.object({
  selfieWithId: z.any()
    .refine((files) => files?.length === 1, 'Image is required.')
    .refine(
      (files) => files[0]?.size <= MAX_FILE_SIZE,
      `Max file size is 5MB.`
    )
    .refine(
      (files) => ACCEPTED_IMAGE_TYPES.includes(files[0]?.type),
      'Only .jpg, .jpeg, and .png formats are supported.'
    ),
});

type WebcamFormData = z.infer<typeof webcamSchema>;

interface WebcamKycFormProps {
  onCapture: (imageData: string) => void;
  disabled?: boolean;
}

export const WebcamKycForm = ({ onCapture, disabled = false }: WebcamKycFormProps) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { handleSubmit, formState: { errors } } = useForm<WebcamFormData>({
    resolver: zodResolver(webcamSchema),
  });

  const startWebcam = useCallback(async () => {
    setIsLoading(true);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing webcam:', error);
      toast.error('Failed to access webcam. Please check permissions.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const stopWebcam = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const captureImage = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg');
        setCapturedImage(imageData);
        onCapture(imageData);
        stopWebcam();
      }
    }
  }, [onCapture, stopWebcam]);

  const retake = useCallback(() => {
    setCapturedImage(null);
    startWebcam();
  }, [startWebcam]);

  // Start webcam when component mounts
  const initializeWebcam = useCallback(() => {
    if (!stream && !capturedImage) {
      startWebcam();
    }
  }, [stream, capturedImage, startWebcam]);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Capture ID Verification Photo</CardTitle>
        <CardDescription>
          Please take a clear photo of yourself holding your ID document.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {!stream && !capturedImage && (
            <Button
              onClick={initializeWebcam}
              disabled={disabled || isLoading}
              className="w-full"
            >
              {isLoading ? 'Accessing Camera...' : 'Start Camera'}
            </Button>
          )}

          {stream && (
            <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <Button
                onClick={captureImage}
                className="absolute bottom-4 left-1/2 transform -translate-x-1/2"
                disabled={disabled}
              >
                Capture Photo
              </Button>
            </div>
          )}

          {capturedImage && (
            <div className="space-y-4">
              <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
                <img
                  src={capturedImage}
                  alt="Captured"
                  className="w-full h-full object-cover"
                />
              </div>
              <Button
                onClick={retake}
                variant="outline"
                className="w-full"
                disabled={disabled}
              >
                Retake Photo
              </Button>
            </div>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <p className="text-sm text-muted-foreground">
          Ensure your face and ID are clearly visible in good lighting.
        </p>
      </CardFooter>
    </Card>
  );
};

