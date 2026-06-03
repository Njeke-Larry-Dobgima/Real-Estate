/**
 * Image upload utility for Supabase Storage
 */

import * as ImagePicker from 'expo-image-picker';
import { supabase, StorageBuckets } from '../lib/supabase';

/**
 * Result of an image upload
 */
export interface UploadResult {
  url: string;
  path: string;
}

/**
 * Pick an image from the device library
 * @returns The selected image URI or null if cancelled
 */
export const pickImage = async (): Promise<string | null> => {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Permission to access media library was denied');
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    return result.assets[0].uri;
  } catch (error) {
    console.error('Error picking image:', error);
    throw error;
  }
};

/**
 * Convert a file URI to a Blob
 */
const uriToBlob = async (uri: string): Promise<Blob> => {
  const response = await fetch(uri);
  return await response.blob();
};

/**
 * Upload an image to Supabase Storage
 * @param uri - Local file URI
 * @param bucket - Storage bucket name
 * @param path - File path within the bucket
 * @returns The public URL of the uploaded file
 */
export const uploadImage = async (
  uri: string,
  bucket: string = StorageBuckets.PROPERTY_IMAGES,
  path: string
): Promise<UploadResult> => {
  try {
    const blob = await uriToBlob(uri);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage.from(bucket).upload(path, blob, {
      contentType: 'image/jpeg',
      upsert: true,
    });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Try to get public URL first
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
    
    // If public URL doesn't work, create a signed URL (valid for 1 year)
    let finalUrl = urlData.publicUrl;
    
    // Test if the public URL is accessible
    try {
      const testResponse = await fetch(finalUrl, { method: 'HEAD' });
      if (!testResponse.ok) {
        // Fall back to signed URL
        const { data: signedData } = await supabase.storage
          .from(bucket)
          .createSignedUrl(data.path, 31536000); // 1 year in seconds
        if (signedData?.signedUrl) {
          finalUrl = signedData.signedUrl;
        }
      }
    } catch {
      // If fetch fails, use signed URL
      const { data: signedData } = await supabase.storage
        .from(bucket)
        .createSignedUrl(data.path, 31536000);
      if (signedData?.signedUrl) {
        finalUrl = signedData.signedUrl;
      }
    }

    return {
      url: finalUrl,
      path: data.path,
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

/**
 * Upload multiple images to Supabase Storage
 * @param uris - Array of local file URIs
 * @param listingId - Listing ID for organizing storage paths
 * @returns Array of public URLs
 */
export const uploadMultipleImages = async (
  uris: string[],
  listingId: string
): Promise<string[]> => {
  const results: string[] = [];
  
  for (let i = 0; i < uris.length; i++) {
    const timestamp = Date.now();
    const path = `listings/${listingId}/${timestamp}_${i}.jpg`;
    const result = await uploadImage(uris[i], StorageBuckets.PROPERTY_IMAGES, path);
    results.push(result.url);
  }

  return results;
};

/**
 * Delete an image from Supabase Storage
 * @param path - File path within the bucket
 * @param bucket - Storage bucket name
 */
export const deleteImage = async (
  path: string,
  bucket: string = StorageBuckets.PROPERTY_IMAGES
): Promise<void> => {
  try {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};
