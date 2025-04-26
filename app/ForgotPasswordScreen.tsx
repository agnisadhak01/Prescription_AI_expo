import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { supabase } from '../components/supabaseClient';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleReset = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: '' // Optionally set a redirect URL after password reset
    });
    if (error) {
      setError(error.message);
    } else {
      setMessage('Password reset email sent! Check your inbox.');
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>Reset Password</Text>
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {error ? <Text style={{ color: 'red', marginBottom: 8 }}>{error}</Text> : null}
      {message ? <Text style={{ color: 'green', marginBottom: 8 }}>{message}</Text> : null}
      <Button mode="contained" style={styles.button} onPress={handleReset} disabled={loading}>
        Send Reset Email
      </Button>
      <Button mode="text" onPress={() => router.replace('/LoginScreen')} style={styles.link}>
        Back to Login
      </Button>
      {loading && <ActivityIndicator style={styles.progress} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { textAlign: 'center', marginBottom: 16 },
  input: { marginBottom: 12 },
  button: { marginVertical: 4, borderRadius: 24, overflow: 'hidden' },
  link: { marginTop: 12 },
  progress: { marginTop: 16 },
}); 