import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from './supabaseClient';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any;
  isEmailVerified: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  resendVerificationEmail: () => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  useEffect(() => {
    const session = supabase.auth.getSession();
    session.then(({ data }) => {
      if (data.session) {
        setUser(data.session.user);
        setIsAuthenticated(true);
        setIsEmailVerified(data.session.user?.email_confirmed_at ? true : false);
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user);
        setIsAuthenticated(true);
        setIsEmailVerified(session.user?.email_confirmed_at ? true : false);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setIsEmailVerified(false);
      }
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    const { error, data } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    setUser(data.user);
    setIsAuthenticated(true);
    return {};
  };

  const register = async (name: string, email: string, password: string) => {
    const { error, data } = await supabase.auth.signUp({ email, password, options: { data: { name } } });
    if (error) return { error: error.message };
    setUser(data.user);
    setIsAuthenticated(true);
    return {};
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAuthenticated(false);
  };

  const resendVerificationEmail = async () => {
    if (!user?.email) return { error: 'No user email found.' };
    const { error } = await supabase.auth.resend({ type: 'signup', email: user.email });
    if (error) return { error: error.message };
    return {};
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, isEmailVerified, login, register, logout, resendVerificationEmail }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}; 