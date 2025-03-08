"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Camera } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function KycForm() {
  const [panNumber, setPanNumber] = useState("");
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Camera states and refs
  const [isActive, setIsActive] = useState<boolean>(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Start the camera when the component is activated
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' }, 
        audio: false 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsActive(true);
        setErrorMessage('');
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setErrorMessage('Unable to access camera. Please check permissions.');
    }
  };

  // Stop the camera stream
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsActive(false);
    }
  };

  // Toggle camera state
  const toggleCamera = () => {
    if (isActive) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  // Capture the current frame from the video
  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw the current video frame to the canvas
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to data URL
        const imageData = canvas.toDataURL('image/jpeg');
        setCapturedImage(imageData);
      }
    }
  };

  // Clean up resources when component unmounts
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Reset to camera view
  const retake = () => {
    stopCamera();
    startCamera();
    setCapturedImage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // In a real application, you would send this data to your backend
    console.log({
      panNumber,
      aadhaarNumber,
      capturedImage,
    });
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    alert("KYC information submitted successfully!");
  };

  return (
    <Card className="shadow-lg bg-black text-white px-20 py-6 max-w-[90vw] mx-auto my-6">
      <CardHeader className="border-b border-gray-800">
        <CardTitle className="text-4xl font-bold">Investor Verification</CardTitle>
        <CardDescription className="text-gray-400">Please provide your identification details and a photo for KYC verification</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pan" className="text-gray-300">PAN Number</Label>
              <Input
                id="pan"
                placeholder="Enter your 10-digit PAN number"
                value={panNumber}
                onChange={(e) => setPanNumber(e.target.value)}
                className="bg-gray-900 border-gray-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="aadhaar" className="text-gray-300">Aadhaar Number</Label>
              <Input
                id="aadhaar"
                placeholder="Enter your 12-digit Aadhaar number"
                value={aadhaarNumber}
                onChange={(e) => setAadhaarNumber(e.target.value)}
                className="bg-gray-900 border-gray-700 text-white"
              />
            </div>
          </div>
          
          <div className="space-y-3">
            <Label className="text-gray-300">Photo Verification</Label>
            
            {errorMessage && (
              <div className="p-2 bg-red-900 text-red-200 rounded-md w-full">
                {errorMessage}
              </div>
            )}
            
            <div className="relative w-full aspect-video bg-gray-900 rounded-md overflow-hidden">
              {!capturedImage ? (
                <video 
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${isActive ? 'block' : 'hidden'}`}
                />
              ) : (
                <img 
                  src={capturedImage} 
                  alt="Captured" 
                  className="w-full h-full object-contain"
                />
              )}
              
              {!isActive && !capturedImage && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Camera size={48} className="text-gray-600" />
                </div>
              )}
              
              {/* Hidden canvas for capturing frames */}
              <canvas ref={canvasRef} className="hidden" />
            </div>
            
            <div className="flex space-x-3">
              {!capturedImage ? (
                <>
                  <Button
                    type="button"
                    onClick={toggleCamera}
                    variant="outline"
                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-white border-gray-700"
                  >
                    {isActive ? "Turn Off Camera" : "Turn On Camera"}
                  </Button>
                  
                  {isActive && (
                    <Button
                      type="button"
                      onClick={captureImage}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      Take Photo
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <Button
                    type="button"
                    onClick={retake}
                    variant="outline"
                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-white border-gray-700"
                  >
                    Retake
                  </Button>
                  
                  <Button
                    type="button"
                    onClick={() => {
                      const a = document.createElement('a');
                      a.href = capturedImage;
                      a.download = 'kyc-photo.jpg';
                      a.click();
                    }}
                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-white border-gray-700"
                  >
                    Download
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="pt-2 pb-6">
          <Button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
            disabled={isSubmitting || !panNumber || !aadhaarNumber || !capturedImage}
          >
            {isSubmitting ? "Submitting..." : "Submit KYC Information"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}