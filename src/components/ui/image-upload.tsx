import * as React from "react"
import { cn } from "./utils"
import { Button } from "./button"
import { UploadIcon, XIcon } from "lucide-react"

export interface ImageUploadProps
  extends React.HTMLAttributes<HTMLDivElement> {
  label?: string
  currentImageUrl?: string | null
  onImageChange?: (url: string) => void
  storageBucket?: string
  storagePath?: string
  maxFileSize?: number // in bytes
  acceptedFormats?: string[]
  disabled?: boolean
}

const ImageUpload = React.forwardRef<
  HTMLDivElement,
  ImageUploadProps
>(({ 
  className, 
  label,
  currentImageUrl, 
  onImageChange, 
  storageBucket,
  storagePath,
  maxFileSize = 5 * 1024 * 1024, // 5MB default
  acceptedFormats = ["image/*"],
  disabled = false,
  ...props 
}, ref) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > maxFileSize) {
        alert(`File size must be less than ${Math.round(maxFileSize / (1024 * 1024))}MB`)
        return
      }
      
      // Check if file format is accepted
      const isAccepted = acceptedFormats.some(format => {
        if (format === "image/*") return file.type.startsWith('image/')
        return file.type === format
      })
      
      if (!isAccepted) {
        alert(`File format not accepted. Please use: ${acceptedFormats.join(', ')}`)
        return
      }

      // Create a temporary URL for preview
      const tempUrl = URL.createObjectURL(file)
      if (onImageChange) {
        onImageChange(tempUrl)
      }
    }
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const file = event.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) {
      if (file.size > maxFileSize) {
        alert(`File size must be less than ${Math.round(maxFileSize / (1024 * 1024))}MB`)
        return
      }
      
      const isAccepted = acceptedFormats.some(format => {
        if (format === "image/*") return file.type.startsWith('image/')
        return file.type === format
      })
      
      if (!isAccepted) {
        alert(`File format not accepted. Please use: ${acceptedFormats.join(', ')}`)
        return
      }

      const tempUrl = URL.createObjectURL(file)
      if (onImageChange) {
        onImageChange(tempUrl)
      }
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click()
    }
  }

  const handleRemove = () => {
    if (onImageChange) {
      onImageChange("")
    }
  }

  return (
    <div
      ref={ref}
      className={cn("space-y-4", className)}
      {...props}
    >
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFormats.join(',')}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />
      
      {currentImageUrl ? (
        <div className="relative">
          <img
            src={currentImageUrl}
            alt="Selected"
            className="w-full h-48 object-cover rounded-lg border"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={handleRemove}
            disabled={disabled}
          >
            <XIcon className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          className={cn(
            "border-2 border-dashed border-gray-300 rounded-lg p-6 text-center transition-colors",
            disabled 
              ? "bg-gray-100 cursor-not-allowed" 
              : "cursor-pointer hover:border-gray-400 bg-gray-50"
          )}
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <UploadIcon className="h-8 w-8 text-gray-400" />
          <div>
            <p className="text-sm text-gray-600">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-gray-500">
              {acceptedFormats.join(', ')} up to {Math.round(maxFileSize / (1024 * 1024))}MB
            </p>
          </div>
        </div>
      )}
    </div>
  )
})
ImageUpload.displayName = "ImageUpload"

export { ImageUpload }
