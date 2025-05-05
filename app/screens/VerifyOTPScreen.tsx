import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useTheme } from '@react-navigation/native';
import { useAuth } from '../../components/AuthContext';
import { supabase } from '../../components/supabaseClient';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function VerifyOTPScreen() {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { user, refreshSession, resendVerificationEmail } = useAuth();
  const router = useRouter();
  const { colors } = useTheme();
  const colorScheme = useColorScheme();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [countdown]);

  const handleVerify = async () => {
    if (!otp) {
      Alert.alert('Error', 'Please enter the OTP');
      return;
    }
    setLoading(true);
    try {
      // Get email from user context
      const email = user?.email;
      if (!email) {
        Alert.alert('Error', 'No user email found.');
        setLoading(false);
        return;
      }
      
      // Verify OTP with Supabase
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'signup'
      });
      
      if (error) {
        Alert.alert('Verification Failed', error.message);
      } else {
        // Refresh session and quota after verification
        const result = await refreshSession();
        if (result.error) {
          Alert.alert('Error', result.error);
        } else {
          Alert.alert(
            'Success', 
            'Email verified successfully!',
            [{ text: 'OK', onPress: () => router.replace('/') }]
          );
        }
      }
    } catch (err) {
      Alert.alert('Error', 'An error occurred during verification.');
      console.error('OTP verification error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    
    setResendLoading(true);
    try {
      const result = await resendVerificationEmail();
      if (result?.error) {
        Alert.alert('Error', result.error);
      } else {
        Alert.alert('Success', 'A new verification email with OTP has been sent to your inbox.');
        setCountdown(60); // 60 second cooldown
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to resend verification email.');
      console.error('Resend error:', err);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text variant="headlineSmall" style={[styles.title, { color: colors.text }]}>Verify OTP</Text>
      <Text style={[styles.instructions, { color: colors.text }]}>
        Enter the 6-digit code sent to your email address.
        You can also click the verification link in the email.
      </Text>
      
      <TextInput
        label="OTP"
        value={otp}
        onChangeText={setOtp}
        style={styles.input}
        keyboardType="numeric"
        maxLength={6}
        theme={{ colors: { primary: colors.primary } }}
      />
      
      <Button 
        mode="contained" 
        style={styles.button} 
        onPress={handleVerify} 
        loading={loading} 
        disabled={loading}
        buttonColor={colors.primary}
      >
        Verify
      </Button>
      
      <Button 
        mode="text" 
        style={styles.button} 
        onPress={handleResendOTP}
        loading={resendLoading}
        disabled={resendLoading || countdown > 0}
        textColor={colors.primary}
      >
        {countdown > 0 ? `Resend OTP (${countdown}s)` : 'Resend OTP'}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    padding: 24 
  },
  title: { 
    textAlign: 'center', 
    marginBottom: 16 
  },
  instructions: {
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.7
  },
  input: { 
    marginBottom: 12,
    backgroundColor: 'transparent'
  },
  button: { 
    marginVertical: 4 
  },
}); 