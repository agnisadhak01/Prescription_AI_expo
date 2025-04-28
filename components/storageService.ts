import { supabase } from './supabaseClient';
import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system';

/**
 * Uploads an image to Supabase Storage
 * @param imageUri - Local URI of the image to upload
 * @param prescriptionId - ID of the prescription this image belongs to
 * @returns The file path of the uploaded image
 */
export const uploadPrescriptionImage = async (imageUri: string, prescriptionId: string): Promise<string> => {
  try {
    // Validate inputs
    if (!imageUri) throw new Error('Image URI is required');
    if (!prescriptionId) throw new Error('Prescription ID is required');
    
    // Read the file as base64
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    
    // Convert to array buffer
    const arrayBuffer = decode(base64);
    
    // Generate a unique file name using timestamp and random string
    const timestamp = new Date().getTime();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const fileName = `${timestamp}_${randomStr}.jpg`;
    const filePath = `${prescriptionId}/${fileName}`;
    
    // Upload to Supabase Storage using the prescription ID as folder name
    const { data, error } = await supabase.storage
      .from('prescription-images')
      .upload(filePath, arrayBuffer, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
      });
    
    if (error) throw error;
    
    // Return the file path (not a public URL)
    return filePath;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

/**
 * Deletes an image from Supabase Storage
 * @param imageUrl - The full URL of the image to delete
 * @returns True if deletion was successful
 */
export const deletePrescriptionImage = async (imageUrl: string): Promise<boolean> => {
  try {
    // Extract the path from the URL
    // Format: https://fwvwxzvynfrqjvizcejf.supabase.co/storage/v1/object/public/prescription-images/PRESCRIPTION_ID/FILENAME
    const urlParts = imageUrl.split('/prescription-images/');
    if (urlParts.length !== 2) throw new Error('Invalid image URL format');
    
    const path = urlParts[1]; // PRESCRIPTION_ID/FILENAME
    
    const { error } = await supabase.storage
      .from('prescription-images')
      .remove([path]);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
};

/**
 * Gets a signed URL for a given file path in the prescription-images bucket
 * @param filePath - Path to the file in the bucket (e.g., prescriptionId/filename.jpg)
 * @param expiresIn - Expiry time in seconds (default: 1 hour)
 * @returns The signed URL string
 */
export const getSignedPrescriptionImageUrl = async (filePath: string, expiresIn: number = 10800): Promise<string | null> => {
  try {
    // Input validation
    if (!filePath) {
      // console.error('Error: Empty file path provided to getSignedPrescriptionImageUrl');
      return null;
    }
    
    // console.log('Generating signed URL for path:', filePath);
    
    // First try to create signed URL
    const { data, error } = await supabase.storage
      .from('prescription-images')
      .createSignedUrl(filePath, expiresIn);
    
    if (error) {
      // console.error('Error generating signed URL:', error.message);
      
      // As fallback, try to get a public URL
      try {
        const publicUrlData = supabase.storage
          .from('prescription-images')
          .getPublicUrl(filePath);
        
        if (publicUrlData.data.publicUrl) {
          // console.log('Using public URL as fallback');
          return publicUrlData.data.publicUrl;
        }
      } catch (fallbackError) {
        // console.error('Public URL fallback also failed:', fallbackError);
      }
      
      throw error;
    }
    
    const signedUrl = data?.signedUrl;
    // console.log('Successfully generated signed URL');
    return signedUrl || null;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    return null;
  }
};

/**
 * Gets all images for a specific prescription (returns signed URLs)
 * @param prescriptionId - ID of the prescription
 * @returns Array of signed image URLs
 */
export const getPrescriptionImages = async (prescriptionId: string): Promise<string[]> => {
  try {
    // List all files in the prescription folder
    const { data, error } = await supabase.storage
      .from('prescription-images')
      .list(prescriptionId);
    
    if (error) throw error;
    if (!data) return [];
    // Generate signed URLs for each file
    const signedUrls: string[] = [];
    for (const file of data) {
      const { data: signedData, error: signedError } = await supabase.storage
        .from('prescription-images')
        .createSignedUrl(`${prescriptionId}/${file.name}`, 3600);
      if (!signedError && signedData?.signedUrl) {
        signedUrls.push(signedData.signedUrl);
      }
    }
    return signedUrls;
  } catch (error) {
    console.error('Error getting prescription images:', error);
    return [];
  }
}; 