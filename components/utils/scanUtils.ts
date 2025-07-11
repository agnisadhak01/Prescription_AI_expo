/**
 * Utilities for prescription scanning and API communication
 */

import { getReadableErrorMessage } from './errorHandler';

/**
 * Sends an image to the OCR API for prescription analysis
 * @param imageUri Local path to the image file
 * @returns Processed OCR data
 */
export async function cameraToApi(imageUri: string) {
  const formData = new FormData();
  formData.append('file', {
    uri: imageUri,
    name: 'photo.jpg',
    type: 'image/jpeg',
  } as any);
  
  // Basic Auth credentials
  const username = 'user';
  const password = 'user@123';
  const basicAuth = 'Basic ' + btoa(`${username}:${password}`);
  
  try {
    const response = await fetch('https://n8n.ausomemgr.com/webhook/prescription-ocr', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': basicAuth,
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server responded with ${response.status}: ${errorText || 'No error details'}`);
    }
    
    try {
      // First get the response as text to check for corruption
      const responseText = await response.text();
      
      // Check if response is empty or too short to be valid
      if (!responseText || responseText.trim().length < 2) {
        throw new Error('Server returned an empty response');
      }
      
      try {
        // Try to parse the JSON
        const jsonData = JSON.parse(responseText);
        
        // Validate response structure
        if (!jsonData || typeof jsonData !== 'object') {
          throw new Error('Invalid response format from server');
        }
        
        return jsonData;
      } catch (parseError: any) {
        console.error('JSON Parse error:', parseError);
        console.error('Response text that failed parsing:', responseText);
        // Specific handling for JSON parse errors
        throw new Error(`JSON Parse error: Failed to read the server response. ${parseError.message || 'Unknown parsing error'}`);
      }
    } catch (parseError: any) {
      console.error('Response processing error:', parseError);
      // Specific handling for JSON parse errors
      throw new Error(`JSON Parse error: Failed to read the server response. ${parseError.message || 'Unknown parsing error'}`);
    }
  } catch (error: any) {
    // Add more context to the error
    const userFriendlyMessage = getReadableErrorMessage(error);
    console.error('Original error:', error);
    
    // Instead of adding a custom property, just throw a new error with the user-friendly message
    throw new Error(userFriendlyMessage);
  }
} 