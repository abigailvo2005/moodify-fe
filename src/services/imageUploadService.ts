// src/services/supabaseImageService.ts
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { supabase, STORAGE_BUCKET } from './supabase';

interface ImageUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

class SupabaseImageService {
  // Request camera permissions
  async requestCameraPermission(): Promise<boolean> {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.log('Camera permission error:', error);
      return false;
    }
  }

  // Request media library permissions
  async requestMediaLibraryPermission(): Promise<boolean> {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.log('Media library permission error:', error);
      return false;
    }
  }

  // Take photo with camera
  async takePhoto(userId: string): Promise<ImageUploadResult> {
    try {
      // Check camera permission
      const hasPermission = await this.requestCameraPermission();
      if (!hasPermission) {
        return { 
          success: false, 
          error: 'Camera permission denied' 
        };
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: false,
      });

      if (result.canceled) {
        return { 
          success: false, 
          error: 'User canceled photo capture' 
        };
      }

      // Upload to Supabase
      const imageUri = result.assets[0].uri;
      const uploadResult = await this.uploadImageToSupabase(imageUri, userId);
      
      return uploadResult;

    } catch (error: any) {
      console.log('Take photo error:', error);
      return { 
        success: false, 
        error: `Failed to take photo: ${error.message}` 
      };
    }
  }

  // Pick photo from gallery
  async pickFromGallery(userId: string): Promise<ImageUploadResult> {
    try {
      // Check media library permission
      const hasPermission = await this.requestMediaLibraryPermission();
      if (!hasPermission) {
        return { 
          success: false, 
          error: 'Media library permission denied' 
        };
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: false,
      });

      if (result.canceled) {
        return { 
          success: false, 
          error: 'You have canceled image selection' 
        };
      }

      // Upload to Supabase
      const imageUri = result.assets[0].uri;
      const uploadResult = await this.uploadImageToSupabase(imageUri, userId);
      
      return uploadResult;

    } catch (error: any) {
      console.log('Pick from gallery error:', error);
      return { 
        success: false, 
        error: `Failed to pick image: ${error.message}` 
      };
    }
  }

  // 🔧 FIXED: Upload image to Supabase Storage (React Native compatible)
  private async uploadImageToSupabase(imageUri: string, userId: string): Promise<ImageUploadResult> {
    try {
      console.log('🔄 Uploading image to Supabase Storage...');
      console.log('📁 Image URI:', imageUri);
      console.log('👤 User ID:', userId);

      // Generate unique filename
      const timestamp = Date.now();
      const fileExtension = imageUri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${userId}/${timestamp}.${fileExtension}`;
      
      console.log('📝 Generated filename:', fileName);

      // ✅ METHOD 1: Using expo-file-system (RECOMMENDED)
      try {
        console.log('🔄 Using expo-file-system method...');
        
        // Read file as base64
        const base64 = await FileSystem.readAsStringAsync(imageUri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        if (!base64 || base64.length === 0) {
          throw new Error('Failed to read image as base64');
        }

        console.log('📦 Base64 length:', base64.length);

        // Convert base64 to Uint8Array
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const uint8Array = new Uint8Array(byteNumbers);

        console.log('📤 Uploading', uint8Array.length, 'bytes to Supabase...');

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(fileName, uint8Array, {
            contentType: this.getContentType(fileExtension),
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          throw error;
        }

        console.log('✅ Upload successful:', data);

        // Get public URL
        const { data: urlData } = supabase.storage
          .from(STORAGE_BUCKET)
          .getPublicUrl(fileName);

        const publicUrl = urlData.publicUrl;
        
        if (!publicUrl || !publicUrl.startsWith('https://')) {
          throw new Error('Invalid public URL received');
        }

        console.log('✅ Public URL obtained:', publicUrl);
        console.log('🎉 Image upload completely successful!');

        return { 
          success: true, 
          url: publicUrl 
        };

      } catch (fsError: any) {
        console.log('⚠️ expo-file-system method failed, trying fetch method...');
        console.log('FileSystem error:', fsError);

        // ✅ METHOD 2: Using fetch as fallback
        console.log('🔄 Using fetch method as fallback...');
        
        const response = await fetch(imageUri);
        
        if (!response.ok) {
          throw new Error(`Fetch failed with status: ${response.status}`);
        }

        // For React Native, we need to use the blob differently
        const blob = await response.blob();
        console.log('📦 Blob created:', blob.size, 'bytes, type:', blob.type);

        if (blob.size === 0) {
          throw new Error('Empty blob created');
        }

        // Convert blob to array buffer using FileReader
        const arrayBuffer = await this.blobToArrayBuffer(blob);
        const uint8Array = new Uint8Array(arrayBuffer);

        console.log('📤 Uploading', uint8Array.length, 'bytes to Supabase...');

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(fileName, uint8Array, {
            contentType: blob.type || this.getContentType(fileExtension),
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          throw error;
        }

        console.log('✅ Upload successful:', data);

        // Get public URL
        const { data: urlData } = supabase.storage
          .from(STORAGE_BUCKET)
          .getPublicUrl(fileName);

        const publicUrl = urlData.publicUrl;
        
        if (!publicUrl || !publicUrl.startsWith('https://')) {
          throw new Error('Invalid public URL received');
        }

        console.log('✅ Public URL obtained:', publicUrl);
        console.log('🎉 Image upload completely successful!');

        return { 
          success: true, 
          url: publicUrl 
        };
      }

    } catch (error: any) {
      console.log('💥 Upload error:', error);
      
      // Handle specific Supabase errors
      if (error.message?.includes('Bucket not found')) {
        return { 
          success: false, 
          error: 'Storage bucket not found. Please create the bucket in Supabase dashboard.' 
        };
      } else if (error.message?.includes('already exists')) {
        return { 
          success: false, 
          error: 'File already exists. Please try again.' 
        };
      } else if (error.message?.includes('Payload too large')) {
        return { 
          success: false, 
          error: 'Image file is too large. Please choose a smaller image.' 
        };
      } else if (error.message?.includes('Invalid API key')) {
        return { 
          success: false, 
          error: 'Invalid Supabase credentials. Please check your API key.' 
        };
      }
      
      return { 
        success: false, 
        error: `Upload failed: ${error.message}` 
      };
    }
  }

  // 🔧 Helper: Convert blob to ArrayBuffer (React Native compatible)
  private blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert blob to ArrayBuffer'));
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(blob);
    });
  }

  // 🔧 Helper: Get content type from file extension
  private getContentType(extension: string): string {
    const contentTypes: { [key: string]: string } = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'bmp': 'image/bmp',
    };
    
    return contentTypes[extension.toLowerCase()] || 'image/jpeg';
  }

  // Delete image from Supabase Storage
  async deleteImage(imageUrl: string): Promise<boolean> {
    try {
      // Extract file path from URL
      const url = new URL(imageUrl);
      const pathParts = url.pathname.split('/');
      const bucketIndex = pathParts.indexOf(STORAGE_BUCKET);
      
      if (bucketIndex === -1) {
        console.log('❌ Invalid image URL for deletion');
        return false;
      }
      
      const filePath = pathParts.slice(bucketIndex + 1).join('/');
      
      console.log('🗑️ Deleting image from Supabase:', filePath);
      
      const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([filePath]);
      
      if (error) {
        console.log('❌ Delete error:', error);
        return false;
      }
      
      console.log('✅ Image deleted successfully');
      return true;
      
    } catch (error: any) {
      console.log('❌ Delete image error:', error);
      return false;
    }
  }

  // Test upload with dummy data
  async testUpload(): Promise<boolean> {
    try {
      console.log('🧪 Testing Supabase upload...');
      
      // Create a test text file
      const testContent = `Test upload at ${new Date().toISOString()}`;
      const testBlob = new Blob([testContent], { type: 'text/plain' });
      const testFileName = `test/upload-test-${Date.now()}.txt`;
      
      const arrayBuffer = await this.blobToArrayBuffer(testBlob);
      const uint8Array = new Uint8Array(arrayBuffer);
      
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(testFileName, uint8Array, {
          contentType: 'text/plain',
        });
      
      if (error) {
        console.log('❌ Test upload failed:', error);
        return false;
      }
      
      console.log('✅ Test upload successful:', data);
      
      // Clean up test file
      await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([testFileName]);
      
      return true;
      
    } catch (error: any) {
      console.log('❌ Test upload error:', error);
      return false;
    }
  }
}

export const supabaseImageService = new SupabaseImageService();
export default supabaseImageService;