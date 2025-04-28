import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from './supabaseClient';

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [scansRemaining, setScansRemaining] = useState<number | null>(null);

  const fetchScansRemaining = async (uid?: string) => {
    const userId = uid || user?.id;
    if (!userId) return;
    try {
      const { data, error } = await supabase
        .from('users')
        .select('scans_remaining')
        .eq('id', userId)
        .single();
      if (error) throw error;
      setScansRemaining(data.scans_remaining);
    } catch (err) {
      setScansRemaining(null);
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
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
        setUser(null);
        setIsAuthenticated(false);
        setIsEmailVerified(false);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        setUser(session.user);
        setIsAuthenticated(true);
        setIsEmailVerified(session.user?.email_confirmed_at ? true : false);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setIsEmailVerified(false);
      }
      setLoading(false);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (user) fetchScansRemaining(user.id);
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
    if (data.user) await fetchScansRemaining(data.user.id);
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
    if (data.user) await fetchScansRemaining(data.user.id);
    return {};
  };

  const logout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setIsAuthenticated(false);
    setLoading(false);
    setScansRemaining(null);
  };

  const resendVerificationEmail = async () => {
    if (!user?.email) return { error: 'No user email found.' };
    const { error } = await supabase.auth.resend({ type: 'signup', email: user.email });
    if (error) return { error: error.message };
    return {};
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, isEmailVerified, loading, login, register, logout, resendVerificationEmail, scansRemaining, refreshScansRemaining: fetchScansRemaining }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}; 