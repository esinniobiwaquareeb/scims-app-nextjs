import React, { useState, useCallback } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Loader2, Upload, X, Image } from 'lucide-react';
import { supabase } from '../../utils/supabase/direct-client';
import { toast } from 'sonner';

interface ImageUploadProps {
  label?: string;
  currentImageUrl?: string;
  onImageChange: (imageUrl: string) => void;
  storageBucket: string;
  storagePath: string;
  maxFileSize?: number; // in bytes
  acceptedFormats?: string[];
  className?: string;
  disabled?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  label = "Image",
  currentImageUrl,
  onImageChange,
  storageBucket,
  storagePath,
  maxFileSize = 5 * 1024 * 1024, // 5MB default
  acceptedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
  className = "",
  disabled = false
}) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageSelect = useCallback((file: File) => {
    if (file) {
      // Validate file type
      if (!acceptedFormats.includes(file.type)) {
        toast.error(`Please select a valid image file. Supported formats: ${acceptedFormats.map(f => f.split('/')[1]).join(', ')}`);
        return;
      }
      
      // Validate file size
      if (file.size > maxFileSize) {
        const maxSizeMB = Math.round(maxFileSize / (1024 * 1024));
        toast.error(`Image file size must be less than ${maxSizeMB}MB`);
        return;
      }

      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [acceptedFormats, maxFileSize]);

  const handleImageUpload = useCallback(async (): Promise<string | null> => {
    if (!imageFile) return null;

    try {
      setIsUploading(true);
      
      // Upload to Supabase Storage
      const fileName = `${storagePath}/${Date.now()}-${imageFile.name}`;
      const { data, error } = await supabase.storage
        .from(storageBucket)
        .upload(fileName, imageFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Image upload error:', error);
        
        // Provide specific error messages based on error type
        if (error.message.includes('row-level security policy')) {
          toast.error('Storage bucket not configured. Please contact administrator to set up image storage.');
        } else if (error.message.includes('bucket')) {
          toast.error('Image storage not available. Please contact administrator.');
        } else if (error.message.includes('file size')) {
          toast.error('File size too large. Please select a smaller image.');
        } else if (error.message.includes('mime type')) {
          toast.error('Invalid file type. Please select a valid image.');
        } else {
          toast.error(`Failed to upload image: ${error.message}`);
        }
        return null;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(storageBucket)
        .getPublicUrl(fileName);

      toast.success('Image uploaded successfully');
      return publicUrl;
    } catch (error) {
      console.error('Image upload error:', error);
      
      // Handle network or other errors
      if (error instanceof Error) {
        if (error.message.includes('fetch')) {
          toast.error('Network error. Please check your connection and try again.');
        } else {
          toast.error(`Upload failed: ${error.message}`);
        }
      } else {
        toast.error('Failed to upload image. Please try again.');
      }
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [imageFile, storageBucket, storagePath]);

  const clearImage = useCallback(() => {
    setImageFile(null);
    setImagePreview(null);
  }, []);

  const handleUploadAndSave = useCallback(async () => {
    if (!imageFile) return;

    const uploadedUrl = await handleImageUpload();
    if (uploadedUrl) {
      onImageChange(uploadedUrl);
      clearImage();
    }
  }, [imageFile, handleImageUpload, onImageChange, clearImage]);

  const removeCurrentImage = useCallback(() => {
    onImageChange('');
  }, [onImageChange]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <Label>{label}</Label>
      
      <div className="space-y-3">
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
              onClick={removeCurrentImage}
              disabled={disabled}
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
              onClick={clearImage}
              disabled={disabled}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        )}
        
        {/* Image Upload Input */}
        <div className="flex items-center gap-3">
          <Input
            type="file"
            accept={acceptedFormats.join(',')}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImageSelect(file);
            }}
            className="flex-1"
            disabled={disabled}
          />
          {imageFile && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleUploadAndSave}
              disabled={isUploading || disabled}
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Upload className="w-4 h-4 mr-2" />
              )}
              {isUploading ? 'Uploading...' : 'Upload'}
            </Button>
          )}
        </div>
        
        {/* File Info */}
        {imageFile && (
          <div className="text-xs text-muted-foreground">
            <p>File: {imageFile.name}</p>
            <p>Size: {formatFileSize(imageFile.size)}</p>
            <p>Type: {imageFile.type}</p>
          </div>
        )}
        
        {/* Help Text */}
        <p className="text-xs text-muted-foreground">
          Supported formats: {acceptedFormats.map(f => f.split('/')[1].toUpperCase()).join(', ')}. 
          Max size: {formatFileSize(maxFileSize)}.
        </p>
      </div>
    </div>
  );
};
