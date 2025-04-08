'use client';

import { ChangeEvent, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { bytesToMB } from '@/lib/utils';

interface FileUploadProps {
  accept: string;
  onFileSelect: (file: File | null) => void;
  maxSizeMB: number;
}

export function FileUpload({ accept, onFileSelect, maxSizeMB }: FileUploadProps) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    // Check file size
    const fileSizeMB = bytesToMB(file.size);
    if (fileSizeMB > maxSizeMB) {
      toast.error(`File size exceeds the maximum limit of ${maxSizeMB}MB`);
      return false;
    }

    // Check file type
    const acceptedTypes = accept.split(',').map(type => type.trim());
    const fileType = file.type;
    const fileExtension = `.${file.name.split('.').pop()}`;

    const isTypeAccepted = acceptedTypes.some(type => {
      if (type === fileType) return true;
      if (type.includes('/*')) {
        const mainType = type.split('/')[0];
        return fileType.startsWith(`${mainType}/`);
      }
      return type === fileExtension;
    });

    if (!isTypeAccepted) {
      toast.error(`File type not accepted. Please upload a ${accept} file`);
      return false;
    }

    return true;
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    
    if (file) {
      if (validateFile(file)) {
        setFileName(file.name);
        onFileSelect(file);
      } else {
        // Reset the input
        if (fileInputRef.current) fileInputRef.current.value = '';
        setFileName(null);
        onFileSelect(null);
      }
    } else {
      setFileName(null);
      onFileSelect(null);
    }
  };

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0] || null;
    if (file) {
      if (validateFile(file)) {
        setFileName(file.name);
        onFileSelect(file);
        
        // Update the file input
        if (fileInputRef.current) {
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          fileInputRef.current.files = dataTransfer.files;
        }
      }
    }
  };

  const handleRemove = () => {
    setFileName(null);
    onFileSelect(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div>
      <input
        type="file"
        className="hidden"
        ref={fileInputRef}
        accept={accept}
        onChange={handleFileChange}
      />
      
      {!fileName ? (
        <div 
          className={`border-2 border-dashed p-6 rounded-md text-center cursor-pointer transition-colors ${
            isDragging ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400'
          }`}
          onClick={handleBrowseClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center space-y-2">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-10 w-10 text-gray-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
              />
            </svg>
            <div className="text-sm text-gray-600">
              <p className="font-medium">Drag and drop your file, or click to browse</p>
              <p className="text-xs">Maximum file size: {maxSizeMB}MB</p>
              <p className="text-xs">Accepted formats: {accept}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="border p-4 rounded-md flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6 text-green-500" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 13l4 4L19 7" 
              />
            </svg>
            <span className="text-sm font-medium truncate max-w-xs">{fileName}</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRemove}
            className="h-8 px-2"
          >
            Remove
          </Button>
        </div>
      )}
    </div>
  );
}

