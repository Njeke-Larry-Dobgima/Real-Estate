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
    // Fetch the image as a blob
    const response = await fetch(uri);
    const blob = await response.blob();

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage.from(bucket).upload(path, blob, {
      contentType: 'image/jpeg',
      upsert: true,
    });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);

    return {
      url: urlData.publicUrl,
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
  const uploadPromises = uris.map((uri, index) => {
    const timestamp = Date.now();
    const path = `listings/${listingId}/${timestamp}_${index}.jpg`;
    return uploadImage(uri, StorageBuckets.PROPERTY_IMAGES, path);
  });

  const results = await Promise.all(uploadPromises);
  return results.map((result) => result.url);
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
