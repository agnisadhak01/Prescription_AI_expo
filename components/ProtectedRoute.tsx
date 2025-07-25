import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from './AuthContext';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user === null) {
      router.replace('/LoginScreen');
    }
  }, [user, router]);

  if (user === undefined) {
    // Auth state is loading
    return null;
  }

  if (user === null) {
    // Redirecting, don't render children
    return null;
  }

  // Authenticated, render children
  return <>{children}</>;
} 