/**
 * Supabase configuration and initialization
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase URL from environment variables
 */
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';

/**
 * Supabase anonymous key from environment variables
 */
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * Supabase client instance
 */
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Helper function to get public URL for a file in Supabase Storage
 * @param bucket - The storage bucket name
 * @param path - The file path within the bucket
 * @returns The public URL for the file
 */
export const getPublicUrl = (bucket: string, path: string): string => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};

/**
 * Storage bucket names
 */
export const StorageBuckets = {
  PROPERTY_IMAGES: 'property-images',
} as const;

export default supabase;
