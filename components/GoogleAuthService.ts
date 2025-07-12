import { GoogleSignin, statusCodes, User } from '@react-native-google-signin/google-signin';
import { supabase } from './supabaseClient';
import 'react-native-url-polyfill/auto';
import { Platform } from 'react-native';

// Initialize Google Sign-In
export const configureGoogleSignIn = () => {
  console.log('Configuring Google Sign-In...');
  
  // Simplify the configuration to the absolute minimum required
  GoogleSignin.configure({
    // Use the web client ID (client_type 3) from google-services.json
    webClientId: '232795038046-rld1dn9s7ocnt93ouec71s27p9ir4pco.apps.googleusercontent.com',
    // Minimum required scopes
    scopes: ['email', 'profile']
  });
  
  console.log('Google Sign-In configured with simplified settings');
};

// Sign in with Google and authenticate with Supabase
export const signInWithGoogle = async (): Promise<{
  userData?: any;
  error?: string;
}> => {
  try {
    console.log('Starting Google Sign-In process...');
    console.log('Platform:', Platform.OS);
    
    // Check if Google Play Services are available
    await GoogleSignin.hasPlayServices({ 
      showPlayServicesUpdateDialog: true 
    });
    console.log('Google Play Services check passed');
    
    // Check if already signed in, and sign out to prevent conflicts
    const isSignedIn = await GoogleSignin.hasPreviousSignIn();
    if (isSignedIn) {
      console.log('User already signed in with Google, signing out first...');
      await GoogleSignin.signOut();
      console.log('Previous Google Sign-In session cleared');
    }
    
    // Complete sign-in process
    console.log('Initiating Google sign-in...');
    const userInfo = await GoogleSignin.signIn();
    console.log('Google Sign-In successful');
    
    // Check userInfo structure for debugging
    console.log('User info keys:', Object.keys(userInfo));
    
    // Log detailed user data including photo URL
    const userData = userInfo?.data as any;
    if (userData) {
      console.log('Google user data available:', !!userData);
      console.log('User email:', userData.email);
    } else {
      console.log('No user data in response, checking userInfo directly');
      // In newer versions, data might be on the root object
      console.log('Email directly from userInfo:', (userInfo as any).email);
      console.log('ID Token directly from userInfo:', !!(userInfo as any).idToken);
    }
    
    // Get ID token (check both structures as implementation might vary)
    const idToken = userData?.idToken || (userInfo as any).idToken;
    
    if (!idToken) {
      console.error('No ID token present in Google Sign-In response');
      console.log('Full userInfo structure:', JSON.stringify(userInfo));
      throw new Error('No ID token present');
    }
    
    console.log('ID Token received, length:', idToken.length);
    console.log('Authenticating with Supabase using Google ID token');
    
    // Sign in to Supabase with the Google token
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: idToken
    });
    
    if (error) {
      console.error('Supabase auth error:', error);
      return { error: error.message };
    }
    
    console.log('Supabase authentication successful');
    return { userData: userData || userInfo };
  } catch (error: any) {
    console.error('Google Sign-In error details:', error);
    
    if (error.code) {
      console.error('Error code:', error.code);
    }
    
    // Enhanced error handling for production builds
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      return { error: 'Sign-in cancelled' };
    } else if (error.code === statusCodes.IN_PROGRESS) {
      return { error: 'Sign-in already in progress' };
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      return { error: 'Play Services not available or outdated. Please update Google Play Services.' };
    } else if (error.code === 'DEVELOPER_ERROR' || error.code === 10) {
      console.error('DEVELOPER_ERROR detected. Details:', error);
      console.error('This typically happens when the SHA-1 fingerprint in Google Cloud Console does not match your app\'s signing key');
      console.error('For production builds, ensure the production SHA-1 fingerprint is added to Google Cloud Console');
      return { 
        error: 'Authentication configuration error. This may be due to incorrect SHA-1 fingerprint setup for production builds. Please contact support.'
      };
    } else if (error.code === 'NETWORK_ERROR') {
      return { error: 'Network error. Please check your internet connection and try again.' };
    } else if (error.code === 'INVALID_ACCOUNT') {
      return { error: 'Invalid Google account. Please try with a different account.' };
    } else if (error.code === 'TIMEOUT') {
      return { error: 'Sign-in timeout. Please try again.' };
    } else if (error.message && error.message.includes('INTERNAL_ERROR')) {
      console.error('Internal error detected - likely certificate/configuration issue');
      return { 
        error: 'Internal authentication error. This may be due to app signing certificate configuration. Please contact support.'
      };
    }
    
    // Log additional details for debugging
    console.error('Additional error details:');
    console.error('- Error message:', error.message);
    console.error('- Error code:', error.code);
    console.error('- Error stack:', error.stack);
    
    return { error: error.message || 'An unknown error occurred during Google sign-in' };
  }
};

// Check if user is already signed in with Google
export const isSignedInWithGoogle = async (): Promise<boolean> => {
  try {
    return await GoogleSignin.hasPreviousSignIn();
  } catch (error) {
    console.error('Failed to check if signed in with Google:', error);
    return false;
  }
};

// Sign out from Google
export const signOutFromGoogle = async (): Promise<void> => {
  try {
    await GoogleSignin.signOut();
    console.log('Successfully signed out from Google');
  } catch (error) {
    console.error('Failed to sign out from Google:', error);
    throw error;
  }
};

// Get current user info if signed in
export const getCurrentGoogleUser = async (): Promise<any | null> => {
  try {
    const isSignedIn = await GoogleSignin.hasPreviousSignIn();
    if (!isSignedIn) {
      console.log('User is not signed in with Google');
      return null;
    }
    
    const userInfo = await GoogleSignin.signInSilently();
    console.log('Retrieved current Google user info');
    return userInfo.data || userInfo; // Return data property to maintain consistency
  } catch (error) {
    console.error('Failed to get current Google user:', error);
    return null;
  }
};

// Debug function to help identify certificate issues
export const debugGoogleSignInConfiguration = async (): Promise<void> => {
  try {
    console.log('=== Google Sign-In Configuration Debug ===');
    console.log('Platform:', Platform.OS);
    console.log('Package name (should be: com.ausomemgr.prescription)');
    console.log('Web Client ID:', '232795038046-rld1dn9s7ocnt93ouec71s27p9ir4pco.apps.googleusercontent.com');
    
    // Check if Play Services are available
    try {
      await GoogleSignin.hasPlayServices();
      console.log('✅ Google Play Services available');
    } catch (error) {
      console.log('❌ Google Play Services not available:', error);
    }
    
    // Check current sign-in status
    try {
      const isSignedIn = await GoogleSignin.hasPreviousSignIn();
      console.log('Current Google sign-in status:', isSignedIn ? 'Signed in' : 'Not signed in');
    } catch (error) {
      console.log('❌ Could not check sign-in status:', error);
    }
    
    console.log('=== End Debug Info ===');
  } catch (error) {
    console.error('Error during debug:', error);
  }
}; 