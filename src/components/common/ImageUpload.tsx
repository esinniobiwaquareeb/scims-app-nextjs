'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface ImageUploadProps {
  currentImageUrl?: string | null;
  onImageChange: (file: File | null, imageUrl: string | null) => void;
  disabled?: boolean;
  className?: string;
  maxSize?: number; // in MB
  acceptedTypes?: string[];
  placeholder?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  currentImageUrl,
  onImageChange,
  disabled = false,
  className = '',
  maxSize = 5, // 5MB default
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
  placeholder = 'Upload image'
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = useCallback((file: File) => {
    // Validate file type
    if (!acceptedTypes.includes(file.type)) {
      toast.error(`Invalid file type. Please select: ${acceptedTypes.join(', ')}`);
      return;
    }

    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      toast.error(`File size too large. Maximum size: ${maxSize}MB`);
      return;
    }

    setSelectedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImagePreview(result);
      onImageChange(file, result);
    };
    reader.readAsDataURL(file);
  }, [acceptedTypes, maxSize, onImageChange]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleRemoveImage = useCallback(() => {
    setSelectedFile(null);
    setImagePreview(null);
    onImageChange(null, null);
  }, [onImageChange]);

  const handleRemoveCurrentImage = useCallback(() => {
    onImageChange(null, null);
  }, [onImageChange]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const getFileInfo = () => {
    if (selectedFile) {
      return {
        name: selectedFile.name,
        size: (selectedFile.size / (1024 * 1024)).toFixed(2),
        type: selectedFile.type
      };
    }
    return null;
  };

  const fileInfo = getFileInfo();

  return (
    <div className={`space-y-3 ${className}`}>
      <Label>Product Image</Label>
      
      {/* Current Image Display */}
      {currentImageUrl && !imagePreview && (
        <div className="relative inline-block">
          <img 
            src={currentImageUrl} 
            alt="Current image" 
            className="w-32 h-32 object-cover rounded-lg border"
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
            onClick={handleRemoveCurrentImage}
            disabled={disabled || isUploading}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      )}
      
      {/* New Image Preview */}
      {imagePreview && (
        <div className="relative inline-block">
          <img 
            src={imagePreview} 
            alt="Image preview" 
            className="w-32 h-32 object-cover rounded-lg border"
          />
          <Button
            type="button"
            size="sm"
            variant="destructive"
            className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
            onClick={handleRemoveImage}
            disabled={disabled || isUploading}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      )}
      
      {/* Upload Area */}
      {!currentImageUrl && !imagePreview && (
        <div
          className={`border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors ${
            disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <div className="flex flex-col items-center space-y-2">
            <Upload className="w-8 h-8 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-700">{placeholder}</p>
              <p className="text-xs text-gray-500">
                Drag and drop or click to browse
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* File Input */}
      <div className="flex items-center gap-3">
        <Input
          type="file"
          accept={acceptedTypes.join(',')}
          onChange={handleFileInputChange}
          className="flex-1"
          disabled={disabled || isUploading}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => (document.querySelector('input[type="file"]') as HTMLInputElement)?.click()}
          disabled={disabled || isUploading}
        >
          <ImageIcon className="w-4 h-4 mr-2" />
          Browse
        </Button>
      </div>
      
      {/* File Info */}
      {fileInfo && (
        <div className="text-xs text-muted-foreground bg-gray-50 p-3 rounded-lg">
          <p className="font-medium mb-1">Selected File:</p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <span>Name: {fileInfo.name}</span>
            <span>Size: {fileInfo.size} MB</span>
            <span>Type: {fileInfo.type}</span>
          </div>
        </div>
      )}
      
      {/* Help Text */}
      <div className="text-xs text-muted-foreground">
        <p>Supported formats: {acceptedTypes.join(', ').replace('image/', '')}</p>
        <p>Maximum size: {maxSize}MB</p>
        {isUploading && (
          <p className="text-blue-600 font-medium">Uploading image...</p>
        )}
      </div>
    </div>
  );
};
