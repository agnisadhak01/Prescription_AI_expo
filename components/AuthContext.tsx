import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { configureGoogleSignIn, signInWithGoogle, signOutFromGoogle } from './GoogleAuthService';
import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any;
  isEmailVerified: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  resendVerificationEmail: () => Promise<{ error?: string }>;
  scansRemaining: number | null;
  refreshScansRemaining: () => Promise<void>;
  refreshSession: () => Promise<{ error?: string }>;
  loginWithGoogle: () => Promise<{ error?: string }>;
  resetNavigationState: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [scansRemaining, setScansRemaining] = useState<number | null>(null);
  const [sessionError, setSessionError] = useState<Error | null>(null);

  // Configure Google Sign-In on initialization
  useEffect(() => {
    configureGoogleSignIn();
  }, []);

  // Recovery function for navigation state issues
  const resetNavigationState = async () => {
    try {
      console.log('Resetting navigation state...');
      await SecureStore.deleteItemAsync('navigation-state');
      await SecureStore.deleteItemAsync('profile_updated');
      // Clear any other persistent app state that might be corrupted
      console.log('Navigation state reset successful');
    } catch (error) {
      console.error('Error resetting navigation state:', error);
    }
  };

  // Error recovery logic
  useEffect(() => {
    if (sessionError) {
      // Show error and offer reset option
      Alert.alert(
        'Session Error',
        'There was a problem with your session. Would you like to reset the app state?',
        [
          {
            text: 'Reset',
            onPress: async () => {
              await resetNavigationState();
              // Attempt to recover the session
              refreshSession().catch(console.error);
              setSessionError(null);
            }
          },
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => setSessionError(null)
          }
        ]
      );
    }
  }, [sessionError]);

  const fetchScansRemaining = async (uid?: string) => {
    if (!user && !uid) {
      return;
    }
    try {
      const { data, error } = await supabase.rpc('get_current_user_quota');
      
      if (error) {
        console.error('Error fetching scan quota:', error);
        throw error;
      }
      
      setScansRemaining(data || 0);
    } catch (err) {
      console.error('Failed to refresh scans remaining:', err);
      setScansRemaining(null);
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Check for any pending profile updates
        const profileUpdated = await SecureStore.getItemAsync('profile_updated');
        if (profileUpdated === 'true') {
          // Clear navigation state and the flag
          await resetNavigationState();
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setUser(session.user);
          setIsAuthenticated(true);
          setIsEmailVerified(session.user?.email_confirmed_at ? true : false);
        } else {
          setUser(null);
          setIsAuthenticated(false);
          setIsEmailVerified(false);
        }
      } catch (error) {
        console.error('Error checking session:', error);
        setSessionError(error as Error);
        setUser(null);
        setIsAuthenticated(false);
        setIsEmailVerified(false);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        if (session) {
          setUser(session.user);
          setIsAuthenticated(true);
          setIsEmailVerified(session.user?.email_confirmed_at ? true : false);
        } else {
          setUser(null);
          setIsAuthenticated(false);
          setIsEmailVerified(false);
        }
      } catch (error) {
        console.error('Error in auth state change handler:', error);
        setSessionError(error as Error);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (user) fetchScansRemaining();
  }, [user]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    const { error, data } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoading(false);
      return { error: error.message };
    }
    setUser(data.user);
    setIsAuthenticated(true);
    setLoading(false);
    if (data.user) await fetchScansRemaining();
    return {};
  };

  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    const { error, data } = await supabase.auth.signUp({ email, password, options: { data: { name } } });
    if (error) {
      setLoading(false);
      return { error: error.message };
    }
    setUser(data.user);
    setIsAuthenticated(true);
    setLoading(false);
    if (data.user) await fetchScansRemaining();
    return {};
  };

  const logout = async () => {
    setLoading(true);
    try {
      // Try to sign out from Google (will only succeed if user signed in with Google)
      try {
        await signOutFromGoogle();
      } catch (err) {
        // Ignore errors from Google sign-out
      }
      
      // Always sign out from Supabase
      await supabase.auth.signOut();
      
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
      setScansRemaining(null);
    } catch (err) {
      setLoading(false);
      console.error('Error during logout:', err);
    }
  };

  const resendVerificationEmail = async () => {
    if (!user?.email) return { error: 'No user email found.' };
    const { error } = await supabase.auth.resend({ 
      type: 'signup', 
      email: user.email 
    });
    if (error) return { error: error.message };
    return {};
  };

  const refreshSession = async (): Promise<{ error?: string }> => {
    try {
      console.log('Refreshing session...');
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error refreshing session:', error);
        return { error: error.message };
      }

      // Get user details to ensure we have the latest metadata including profile picture
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('Error getting user data:', userError);
        return { error: userError.message };
      }
      
      if (userData.user) {
        setUser(userData.user);
        setIsAuthenticated(true);
        setIsEmailVerified(userData.user.email_confirmed_at ? true : false);
        await fetchScansRemaining();
        console.log('Session refreshed successfully with user data');
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setIsEmailVerified(false);
        console.log('Session refreshed but no user found');
      }
      
      return {};
    } catch (err: any) {
      console.error('Unknown error refreshing session:', err);
      return { error: err.message || 'An unknown error occurred' };
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const { userData, error } = await signInWithGoogle();
      
      if (error) {
        setLoading(false);
        return { error };
      }
      
      // Fetch user session to get the Supabase user
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // If the user has a Google profile photo, update the user metadata to include it
        if (userData?.photoUrl) {
          console.log('Updating user metadata with Google profile photo:', userData.photoUrl);
          await supabase.auth.updateUser({
            data: { 
              picture: userData.photoUrl,
              // Make sure to preserve existing name if available
              name: userData.name || session.user?.user_metadata?.name
            }
          });
          
          // Refresh user session to get updated metadata
          const { data: { user: updatedUser } } = await supabase.auth.getUser();
          setUser(updatedUser);
        } else {
          setUser(session.user);
        }
        
        setIsAuthenticated(true);
        setIsEmailVerified(session.user?.email_confirmed_at ? true : false);
        await fetchScansRemaining();
      } else {
        return { error: 'Failed to get user session after Google sign-in' };
      }
      
      setLoading(false);
      return {};
    } catch (err: any) {
      setLoading(false);
      return { error: err.message || 'An error occurred during Google sign-in' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        isEmailVerified,
        loading,
        login,
        register,
        logout,
        resendVerificationEmail,
        scansRemaining,
        refreshScansRemaining: fetchScansRemaining,
        refreshSession,
        loginWithGoogle,
        resetNavigationState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}; 