import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { supabase } from './supabaseClient';
import 'react-native-url-polyfill/auto';

// Initialize Google Sign-In
export const configureGoogleSignIn = () => {
  GoogleSignin.configure({
    // Web client ID from Google Cloud Console
    webClientId: '232795038046-rld1dn9s7ocnt93ouec71s27p9ir4pco.apps.googleusercontent.com',
    scopes: ['profile', 'email', 'openid'],
    offlineAccess: true, // Enable to get refresh token
    forceCodeForRefreshToken: true, // Force code refresh
  });
};

// Sign in with Google and authenticate with Supabase
export const signInWithGoogle = async (): Promise<{
  userData?: any;
  error?: string;
}> => {
  try {
    console.log('Starting Google Sign-In process...');
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    
    // Check if already signed in, and sign out to prevent conflicts
    const isSignedIn = await GoogleSignin.hasPreviousSignIn();
    if (isSignedIn) {
      console.log('User already signed in with Google, signing out first...');
      await GoogleSignin.signOut();
    }
    
    // Complete sign-in process
    const userInfo = await GoogleSignin.signIn();
    console.log('Google Sign-In successful, got user info:', JSON.stringify(userInfo).substring(0, 100) + '...');
    
    // Check userInfo structure for debugging
    console.log('User info keys:', Object.keys(userInfo));
    
    // Log detailed user data including photo URL
    const userData = userInfo?.data as any;
    console.log('Google user data details:', {
      name: userData?.name,
      email: userData?.email, 
      photoUrl: userData?.photoUrl,
      familyName: userData?.familyName,
      givenName: userData?.givenName,
      id: userData?.id
    });
    
    // The idToken is inside userInfo.data, not directly on userInfo
    const idToken = userInfo?.data?.idToken;
    
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
    return { userData: userInfo.data };
  } catch (error: any) {
    console.error('Google Sign-In error details:', error);
    
    if (error.code) {
      console.error('Error code:', error.code);
    }
    
    // Handle specific error codes
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      return { error: 'Sign-in cancelled' };
    } else if (error.code === statusCodes.IN_PROGRESS) {
      return { error: 'Sign-in already in progress' };
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      return { error: 'Play Services not available' };
    } else if (error.code === 'DEVELOPER_ERROR' || error.code === 10) {
      return { 
        error: 'Developer Error: SHA-1 fingerprint or OAuth configuration may be incorrect. Check Google Cloud Console configuration.'
      };
    }
    
    return { error: error.message || 'An unknown error occurred' };
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
    return userInfo.data; // Return data property to maintain consistency
  } catch (error) {
    console.error('Failed to get current Google user:', error);
    return null;
  }
}; 