import { supabase } from './supabaseClient';
import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system';

/**
 * Uploads an image to Supabase Storage
 * @param imageUri - Local URI of the image to upload
 * @param prescriptionId - ID of the prescription this image belongs to
 * @returns The public URL of the uploaded image
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
    
    // Upload to Supabase Storage using the prescription ID as folder name
    const { data, error } = await supabase.storage
      .from('prescription-images')
      .upload(`${prescriptionId}/${fileName}`, arrayBuffer, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
      });
    
    if (error) throw error;
    
    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('prescription-images')
      .getPublicUrl(`${prescriptionId}/${fileName}`);
    
    return publicUrl;
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
 * Gets all images for a specific prescription
 * @param prescriptionId - ID of the prescription
 * @returns Array of image URLs
 */
export const getPrescriptionImages = async (prescriptionId: string): Promise<string[]> => {
  try {
    // List all files in the prescription folder
    const { data, error } = await supabase.storage
      .from('prescription-images')
      .list(prescriptionId);
    
    if (error) throw error;
    
    // Convert to public URLs
    return data.map(file => {
      const { data: { publicUrl } } = supabase.storage
        .from('prescription-images')
        .getPublicUrl(`${prescriptionId}/${file.name}`);
      return publicUrl;
    });
  } catch (error) {
    console.error('Error getting prescription images:', error);
    return [];
  }
}; 