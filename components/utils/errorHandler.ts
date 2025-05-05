/**
 * Error handling utilities for prescription processing
 */

import { Alert } from 'react-native';

/**
 * Maps technical error messages to user-friendly messages
 * @param error The error object or message to process
 * @returns A user-friendly error message
 */
export const getReadableErrorMessage = (error: any): string => {
  // Extract the error message if it's an object
  const errorMessage = typeof error === 'string' 
    ? error 
    : error?.message || 'An unknown error occurred';
  
  // Check for JSON parse errors
  if (errorMessage.includes('JSON Parse error') || 
      errorMessage.includes('Unexpected end of input') || 
      errorMessage.includes('SyntaxError')) {
    return 'The server response was incomplete or invalid. This could be due to network issues or server problems.';
  }
  
  // Check for network errors
  if (errorMessage.includes('Network request failed') || 
      errorMessage.includes('Failed to fetch') ||
      errorMessage.includes('connect ETIMEDOUT')) {
    return 'Unable to connect to the server. Please check your internet connection and try again.';
  }

  // Check for timeout errors
  if (errorMessage.includes('timeout') || 
      errorMessage.includes('timed out')) {
    return 'The request took too long to complete. Please try again when you have a stronger connection.';
  }

  // Check for server errors
  if (errorMessage.includes('500') || 
      errorMessage.includes('502') || 
      errorMessage.includes('503') || 
      errorMessage.includes('504')) {
    return 'The server encountered an error. Our team has been notified and is working on it.';
  }

  // Check for image-specific errors
  if (errorMessage.includes('image') || 
      errorMessage.includes('photo') || 
      errorMessage.includes('file')) {
    return 'There was a problem with the prescription image. Please take a clearer photo and try again.';
  }

  // Default case for other errors
  return 'There was a problem processing your prescription. Please try again.';
};

/**
 * Shows an error alert with a user-friendly message and appropriate actions
 * @param error The error that occurred
 * @param options Optional configuration for the alert
 */
export const showErrorAlert = (
  error: any, 
  options: {
    title?: string;
    navigateToHome?: boolean;
    navigateHome?: () => void;
    retryAction?: () => void;
    onDismiss?: () => void;
  } = {}
) => {
  const {
    title = 'Processing Error',
    navigateToHome = false,
    navigateHome,
    retryAction,
    onDismiss
  } = options;

  const message = getReadableErrorMessage(error);
  
  // Create action buttons based on options
  const buttons = [];
  
  // Add retry button if a retry action is provided
  if (retryAction) {
    buttons.push({
      text: 'Try Again',
      onPress: retryAction
    });
  }
  
  // Add home navigation if requested
  if (navigateToHome && navigateHome) {
    buttons.push({
      text: 'Go Back',
      onPress: () => {
        navigateHome();
        if (onDismiss) onDismiss();
      }
    });
  }
  
  // Always have at least an OK button
  if (buttons.length === 0) {
    buttons.push({
      text: 'OK',
      onPress: onDismiss
    });
  }
  
  // Show the alert
  Alert.alert(title, message, buttons);
  
  // Log the error for debugging
  console.error('API Error:', error);
}; 