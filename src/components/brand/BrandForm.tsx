import React from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { DialogFooter } from '../ui/dialog';
import { ImageUpload } from '../ui/image-upload';
import { BRAND_FORM_FIELDS } from './BrandConstants';
import { BrandFormData } from './BrandHelpers';

interface BrandFormProps {
  formData: BrandFormData;
  onChange: (field: keyof BrandFormData, value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  submitText: string;
}

export const BrandForm: React.FC<BrandFormProps> = ({
  formData,
  onChange,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitText
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        {/* Logo Upload Section */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Brand Logo</Label>
          <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
            <ImageUpload
              label=""
              currentImageUrl={formData.logo_url}
              onImageChange={(url) => onChange('logo_url', url)}
              storageBucket="brands"
              storagePath={`${Date.now()}`}
              maxFileSize={2 * 1024 * 1024} // 2MB for logos
              acceptedFormats={['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml']}
              disabled={isSubmitting}
              className=""
            />
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Upload a logo to make your brand more recognizable. Recommended size: 200x200px
          </p>
        </div>

        {/* Regular Form Fields */}
        {Object.entries(BRAND_FORM_FIELDS).map(([field, config]) => (
          <div key={field} className="space-y-2">
            <Label htmlFor={field}>
              {config.label}
              {config.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {field === 'description' ? (
              <Textarea
                id={field}
                value={formData[field as keyof BrandFormData]}
                onChange={(e) => onChange(field as keyof BrandFormData, e.target.value)}
                placeholder={config.placeholder}
                rows={3}
              />
            ) : (
              <Input
                id={field}
                type={field.includes('email') ? 'email' : field.includes('website') ? 'url' : 'text'}
                value={formData[field as keyof BrandFormData]}
                onChange={(e) => onChange(field as keyof BrandFormData, e.target.value)}
                placeholder={config.placeholder}
                required={config.required}
              />
            )}
          </div>
        ))}
      </div>
      
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : submitText}
        </Button>
      </DialogFooter>
    </form>
  );
};