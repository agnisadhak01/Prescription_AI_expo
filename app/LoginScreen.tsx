import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../components/AuthContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)/PrescriptionsScreen');
    }
  }, [isAuthenticated]);

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    const result = await login(email, password);
    if (result.error) {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <LinearGradient colors={["#6a11cb", "#2575fc"]} style={styles.gradient}>
      <View style={styles.container}>
        <Text variant="headlineMedium" style={styles.title}>AI Prescription Saathi</Text>
        <Text variant="titleMedium" style={styles.subtitle}>Login to your account</Text>
        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          secureTextEntry
        />
        {error ? <Text style={{ color: 'red', marginBottom: 8 }}>{error}</Text> : null}
        <Button mode="contained" style={styles.button} onPress={handleLogin} disabled={loading} contentStyle={styles.buttonContent}>
          Login
        </Button>
        <Button mode="text" onPress={() => router.push('./ForgotPasswordScreen')} style={styles.textButton} labelStyle={styles.textButtonLabel}>
          Forgot Password?
        </Button>
        <Button mode="text" onPress={() => router.push('./RegisterScreen')} style={styles.textButton} labelStyle={styles.textButtonLabel}>
          Register
        </Button>
        {loading && <ActivityIndicator style={styles.progress} />}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { textAlign: 'center', marginBottom: 8, color: '#fff' },
  subtitle: { textAlign: 'center', marginBottom: 16, color: '#fff' },
  input: { marginBottom: 12, backgroundColor: 'rgba(255,255,255,0.9)' },
  button: { marginVertical: 4, borderRadius: 24, overflow: 'hidden' },
  buttonContent: { height: 48 },
  textButton: { marginTop: 8 },
  textButtonLabel: { color: '#fff', fontWeight: 'bold' },
  progress: { marginTop: 16 },
}); 