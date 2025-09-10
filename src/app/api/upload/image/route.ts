import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';

interface StorageError {
  message?: string;
  statusCode?: string;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const storeId = formData.get('storeId') as string;
    const type = formData.get('type') as string || 'product';

    if (!file || !storeId) {
      return NextResponse.json(
        { success: false, error: 'File and storeId are required' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File size too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${type}_${storeId}_${timestamp}.${fileExtension}`;
    const filePath = `uploads/${storeId}/${type}/${fileName}`;

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Try to upload to Supabase Storage
    let uploadData, uploadError;
    
    try {
      const result = await supabase.storage
        .from('images')
        .upload(filePath, buffer, {
          contentType: file.type,
          cacheControl: '3600',
          upsert: false
        });
      
      uploadData = result.data;
      uploadError = result.error;
    } catch (error) {
      console.error('Storage bucket error:', error);
      uploadError = error;
    }

    // If bucket doesn't exist, try to create it
    if (uploadError && (uploadError as StorageError).message?.includes('Bucket not found')) {
      console.log('Creating images bucket...');
      
      try {
        // Try to create the bucket
        const { error: createError } = await supabase.storage.createBucket('images', {
          public: true,
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
          fileSizeLimit: 5242880 // 5MB
        });
        
        if (createError) {
          console.error('Failed to create bucket:', createError);
          // Fall back to base64 storage in database
          console.log('Falling back to base64 storage...');
          
          const base64 = buffer.toString('base64');
          const dataUrl = `data:${file.type};base64,${base64}`;
          
          return NextResponse.json({
            success: true,
            url: dataUrl,
            path: `base64_${fileName}`,
            fileName: fileName,
            isBase64: true
          });
        }
        
        // Retry upload after creating bucket
        const retryResult = await supabase.storage
          .from('images')
          .upload(filePath, buffer, {
            contentType: file.type,
            cacheControl: '3600',
            upsert: false
          });
        
        uploadData = retryResult.data;
        uploadError = retryResult.error;
      } catch (createError) {
        console.error('Failed to create bucket:', createError);
        // Fall back to base64 storage in database
        console.log('Falling back to base64 storage...');
        
        const base64 = buffer.toString('base64');
        const dataUrl = `data:${file.type};base64,${base64}`;
        
        return NextResponse.json({
          success: true,
          url: dataUrl,
          path: `base64_${fileName}`,
          fileName: fileName,
          isBase64: true
        });
      }
    }

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      
      // If it's a storage-related error, try base64 fallback
      if ((uploadError as StorageError).message?.includes('storage') || (uploadError as StorageError).message?.includes('bucket')) {
        console.log('Storage error detected, falling back to base64 storage...');
        
        const base64 = buffer.toString('base64');
        const dataUrl = `data:${file.type};base64,${base64}`;
        
        return NextResponse.json({
          success: true,
          url: dataUrl,
          path: `base64_${fileName}`,
          fileName: fileName,
          isBase64: true
        });
      }
      
      return NextResponse.json(
        { success: false, error: 'Failed to upload image to storage' },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('images')
      .getPublicUrl(uploadData?.path || filePath);

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      path: uploadData?.path || filePath,
      fileName: fileName
    });

  } catch (error) {
    console.error('Image upload API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
