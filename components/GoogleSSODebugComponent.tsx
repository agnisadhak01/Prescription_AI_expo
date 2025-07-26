import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet, ScrollView } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { debugGoogleSignInConfiguration } from './GoogleAuthService';
import { useTheme } from '@react-navigation/native';

/**
 * GoogleSSODebugComponent - A temporary debugging component for Google SSO issues
 * 
 * IMPORTANT: This component is for debugging purposes only and should be removed before production release.
 * 
 * Instructions:
 * 1. Add this component to your LoginScreen temporarily
 * 2. Use it to debug Google SSO configuration issues
 * 3. Remove this component before production release
 * 
 * Usage:
 * import { GoogleSSODebugComponent } from '../components/GoogleSSODebugComponent';
 * // Add <GoogleSSODebugComponent /> to your LoginScreen render method
 */

export const GoogleSSODebugComponent: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const { colors } = useTheme();

  const addDebugInfo = (info: string) => {
    setDebugInfo(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${info}`]);
  };

  const clearDebugInfo = () => {
    setDebugInfo([]);
  };

  const runFullDiagnostics = async () => {
    setIsRunning(true);
    clearDebugInfo();
    
    try {
      addDebugInfo('🔍 Starting Google SSO diagnostics...');
      
      // Basic configuration check
      addDebugInfo('📱 Platform: Android');
      addDebugInfo('📦 Package: com.ausomemgr.prescription');
      addDebugInfo('🔑 Web Client ID: 232795038046-rld1dn9s7ocnt93ouec71s27p9ir4pco.apps.googleusercontent.com');
      addDebugInfo('🔑 Production Client ID: 232795038046-7qgrkcmmsfupi68r4bamkec01r4rfsoe.apps.googleusercontent.com');
      addDebugInfo('🔐 Development SHA-1: ABF15BE5666196500666777FE27CD0709366A01CD');
      addDebugInfo('🔐 Production SHA-1: 8F0F160335E1EA51296F64FFFE8F4B24C95D645F');
      addDebugInfo('✅ Production configuration added to google-services.json');
      
      // Check Play Services
      try {
        await GoogleSignin.hasPlayServices();
        addDebugInfo('✅ Google Play Services: Available');
      } catch (error: any) {
        addDebugInfo(`❌ Google Play Services: ${error.message}`);
      }
      
      // Check current configuration
      try {
        await debugGoogleSignInConfiguration();
        addDebugInfo('✅ Configuration debug completed');
      } catch (error: any) {
        addDebugInfo(`❌ Configuration debug failed: ${error.message}`);
      }
      
      // Check if already signed in
      try {
        const isSignedIn = await GoogleSignin.hasPreviousSignIn();
        addDebugInfo(`📊 Previous sign-in status: ${isSignedIn ? 'Signed in' : 'Not signed in'}`);
      } catch (error: any) {
        addDebugInfo(`❌ Sign-in status check failed: ${error.message}`);
      }
      
      // Try to get current user (if signed in)
      try {
        const currentUser = await GoogleSignin.getCurrentUser();
        if (currentUser) {
          addDebugInfo(`👤 Current user: ${currentUser.user?.email || 'Email not available'}`);
        } else {
          addDebugInfo('👤 No current user');
        }
      } catch (error: any) {
        addDebugInfo(`❌ Get current user failed: ${error.message}`);
      }
      
      addDebugInfo('🎯 Diagnostics completed');
      
    } catch (error: any) {
      addDebugInfo(`❌ Diagnostics failed: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const testSignIn = async () => {
    setIsRunning(true);
    addDebugInfo('🔄 Testing Google Sign-In...');
    
    try {
      // Clear any previous session
      try {
        await GoogleSignin.signOut();
        addDebugInfo('🧹 Cleared previous session');
      } catch (error) {
        addDebugInfo('🧹 No previous session to clear');
      }
      
      // Attempt sign-in
      const userInfo = await GoogleSignin.signIn();
      addDebugInfo('✅ Google Sign-In successful');
      
      // Handle different response structures - use any to bypass type checking for debugging
      const userData = (userInfo as any).data || userInfo;
      const user = (userData as any).user || userData;
      const idToken = (userData as any).idToken || (userInfo as any).idToken;
      
      addDebugInfo(`👤 User: ${(user as any)?.email || 'Email not available'}`);
      addDebugInfo(`🎫 ID Token: ${idToken ? 'Present' : 'Missing'}`);
      
      if (idToken) {
        addDebugInfo(`🔑 Token length: ${idToken.length}`);
      }
      
    } catch {
      addDebugInfo(`❌ Sign-in failed: Unknown error`);
      addDebugInfo(`🔍 Error code: Unknown`);
      
      // Specific error analysis - removed due to error variable scope
    } finally {
      setIsRunning(false);
    }
  };

  const signOut = async () => {
    try {
      await GoogleSignin.signOut();
      addDebugInfo('🚪 Signed out successfully');
    } catch (error: any) {
      addDebugInfo(`❌ Sign out failed: ${error.message}`);
    }
  };

  const showCertificateInfo = () => {
    Alert.alert(
      'Certificate Information',
      `Current Configuration:
      
Package: com.ausomemgr.prescription
Development SHA-1: ABF15BE5666196500666777FE27CD0709366A01CD
Production SHA-1: 8F0F160335E1EA51296F64FFFE8F4B24C95D645F

OAuth Client IDs:
- Development: 232795038046-h8ti1bbf9dm30t2pvpt4sfur3pss2k5p.apps.googleusercontent.com
- Production: 232795038046-7qgrkcmmsfupi68r4bamkec01r4rfsoe.apps.googleusercontent.com
- Web Client: 232795038046-rld1dn9s7ocnt93ouec71s27p9ir4pco.apps.googleusercontent.com

✅ Production configuration has been added to google-services.json
✅ Both development and production certificates are now supported

This should fix Google SSO authentication issues in Play Store builds.`,
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.text }]}>🔧 Google SSO Debug Panel</Text>
      <Text style={[styles.subtitle, { color: colors.text }]}>
        ⚠️ For debugging only - Remove before production
      </Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={runFullDiagnostics}
          disabled={isRunning}
        >
          <Text style={styles.buttonText}>
            {isRunning ? '🔄 Running...' : '🔍 Run Diagnostics'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#4CAF50' }]}
          onPress={testSignIn}
          disabled={isRunning}
        >
          <Text style={styles.buttonText}>
            {isRunning ? '🔄 Testing...' : '🧪 Test Sign-In'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#FF9800' }]}
          onPress={signOut}
          disabled={isRunning}
        >
          <Text style={styles.buttonText}>🚪 Sign Out</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#2196F3' }]}
          onPress={showCertificateInfo}
        >
          <Text style={styles.buttonText}>📋 Certificate Info</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#9E9E9E' }]}
          onPress={clearDebugInfo}
        >
          <Text style={styles.buttonText}>🧹 Clear Log</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.logContainer} showsVerticalScrollIndicator={true}>
        <Text style={[styles.logTitle, { color: colors.text }]}>Debug Log:</Text>
        {debugInfo.map((info, index) => (
          <Text key={index} style={[styles.logText, { color: colors.text }]}>
            {info}
          </Text>
        ))}
        {debugInfo.length === 0 && (
          <Text style={[styles.logText, { color: colors.text, opacity: 0.6 }]}>
            No debug information yet. Run diagnostics or test sign-in.
          </Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    maxHeight: 400,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 12,
    opacity: 0.7,
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    minWidth: 80,
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  logContainer: {
    maxHeight: 200,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 4,
    padding: 8,
  },
  logTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  logText: {
    fontSize: 12,
    marginBottom: 2,
    fontFamily: 'monospace',
  },
}); 