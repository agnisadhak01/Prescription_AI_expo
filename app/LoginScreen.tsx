import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../components/AuthContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      login();
      setLoading(false);
    }, 1000);
  };

  const handleDemoLogin = () => {
    login(true);
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
        <Button mode="contained" style={styles.button} onPress={handleLogin} disabled={loading} contentStyle={styles.buttonContent}>
          Login
        </Button>
        <Button mode="contained" style={styles.demoButton} onPress={() => { setLoading(true); setTimeout(() => { handleDemoLogin(); setLoading(false); }, 500); }} contentStyle={styles.buttonContent} labelStyle={styles.demoButtonLabel}>
          Demo Login
        </Button>
        <Button mode="text" style={styles.textButton} labelStyle={styles.textButtonLabel} onPress={() => {}} disabled={loading}>
          Test Connection
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
  demoButton: { marginVertical: 4, borderRadius: 24, overflow: 'hidden', backgroundColor: '#fff' },
  demoButtonLabel: { color: '#2575fc', fontWeight: 'bold' },
  buttonContent: { height: 48 },
  textButton: { marginTop: 8 },
  textButtonLabel: { color: '#fff', fontWeight: 'bold' },
  progress: { marginTop: 16 },
}); 