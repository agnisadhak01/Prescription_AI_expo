import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useAuth } from '../../components/AuthContext';
import { supabase } from '../../components/supabaseClient';

export default function VerifyOTPScreen() {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, refreshSession } = useAuth();

  const handleVerify = async () => {
    if (!otp) {
      Alert.alert('Error', 'Please enter the OTP');
      return;
    }
    setLoading(true);
    try {
      // You may need to get the email from user context or navigation params
      const email = user?.email;
      if (!email) {
        Alert.alert('Error', 'No user email found.');
        setLoading(false);
        return;
      }
      // Verify OTP with Supabase
      const { error } = await (supabase.auth.verifyOtp
        ? supabase.auth.verifyOtp({ email, token: otp, type: 'email' })
        : { error: { message: 'verifyOtp not available' } });
      if (error) {
        Alert.alert('Verification Failed', error.message);
      } else {
        // Refresh session and quota after verification
        const result = await refreshSession();
        if (result.error) {
          Alert.alert('Error', result.error);
        } else {
          Alert.alert('Success', 'Email verified and quota updated!');
        }
      }
    } catch (err) {
      Alert.alert('Error', 'An error occurred during verification.');
      console.error('OTP verification error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>Verify OTP</Text>
      <TextInput
        label="OTP"
        value={otp}
        onChangeText={setOtp}
        style={styles.input}
        keyboardType="numeric"
      />
      <Button mode="contained" style={styles.button} onPress={handleVerify} loading={loading} disabled={loading}>
        Verify
      </Button>
      <Button mode="text" style={styles.button} onPress={() => {}}>
        Resend OTP
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { textAlign: 'center', marginBottom: 16 },
  input: { marginBottom: 12 },
  button: { marginVertical: 4 },
}); 