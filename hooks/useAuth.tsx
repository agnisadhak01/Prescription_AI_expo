import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../lib/supabase';

// Define the authentication context type
type AuthContextType = {
  user: any | null;
  session: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  // Scan quota fields
  scansRemaining: number;
  optimisticScans: number | null;
  refreshScansRemaining: () => Promise<void>;
  useOptimisticScan: () => Promise<boolean>;
};

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Scan quota state
  const [scansRemaining, setScansRemaining] = useState<number>(0);
  const [optimisticScans, setOptimisticScans] = useState<number | null>(null);

  // Initialize auth state on mount
  useEffect(() => {
    // Get current session
    const initializeAuth = async () => {
      try {
        setLoading(true);
        
        // Get current session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          return;
        }
        
        setSession(session);
        
        if (session) {
          setUser(session.user);
          // Get user's scan quota
          await refreshScansRemaining();
        }
        
      } catch (error) {
        console.error('Error initializing auth:', error);
        Alert.alert('Authentication Error', 'Failed to initialize authentication');
      } finally {
        setLoading(false);
      }
    };
    
    initializeAuth();
    
    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Refresh scan quota on auth changes
      if (session) {
        await refreshScansRemaining();
      } else {
        // Reset quota when logging out
        setScansRemaining(0);
        setOptimisticScans(null);
      }
    });
    
    // Clean up subscription
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);
  
  // Function to refresh the user's scan quota
  // Updates scan quota using global context
  const refreshScansRemaining = async () => {
    try {
      if (!user) return;
      
      // Call RPC function to get current quota
      const { data, error } = await supabase.rpc('get_current_user_quota');
      
      if (error) {
        console.error('Error fetching scan quota:', error);
        Alert.alert('Error', 'Failed to fetch your remaining scans');
        return;
      }
      
      setScansRemaining(data || 0);
      // Reset optimistic update
      setOptimisticScans(null);
      
    } catch (error) {
      console.error('Error refreshing scans:', error);
      Alert.alert('Error', 'Failed to update your scan quota');
    }
  };
  
  // Function to use a scan with optimistic UI update
  // Updates scan quota using global context
  const useOptimisticScan = async (): Promise<boolean> => {
    try {
      if (!user) return false;
      
      // Check if user has scans remaining
      const currentScans = optimisticScans !== null ? optimisticScans : scansRemaining;
      
      if (currentScans <= 0) {
        Alert.alert(
          'No Scans Remaining', 
          'You have no scans remaining. Please purchase more to continue.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Purchase', 
              onPress: () => {
                // Navigate to subscription page - this will be handled by the component
                // that calls useOptimisticScan()
              }
            }
          ]
        );
        return false;
      }
      
      // Set optimistic update
      setOptimisticScans(currentScans - 1);
      
      // Call API to use scan
      const { data, error } = await supabase.rpc('use_scan_quota', {
        p_user_id: user.id
      });
      
      if (error) {
        console.error('Error using scan:', error);
        Alert.alert('Error', 'Failed to use scan');
        // Revert optimistic update
        setOptimisticScans(currentScans);
        return false;
      }
      
      // After successful scan, refresh the quota from the server
      await refreshScansRemaining();
      return true;
      
    } catch (error) {
      console.error('Error using scan:', error);
      Alert.alert('Error', 'Failed to use scan');
      // Reset optimistic update on error
      setOptimisticScans(null);
      return false;
    }
  };
  
  // Auth functions
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) throw error;
      
      // Quota is refreshed in the auth state change listener
    } catch (error: any) {
      Alert.alert('Sign In Error', error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({ email, password });
      
      if (error) throw error;
      
      Alert.alert('Registration Successful', 'Please check your email for verification');
    } catch (error: any) {
      Alert.alert('Sign Up Error', error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      // Reset quota state
      setScansRemaining(0);
      setOptimisticScans(null);
    } catch (error: any) {
      Alert.alert('Sign Out Error', error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Create the context value
  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    // Scan quota
    scansRemaining,
    optimisticScans,
    refreshScansRemaining,
    useOptimisticScan,
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default useAuth; 