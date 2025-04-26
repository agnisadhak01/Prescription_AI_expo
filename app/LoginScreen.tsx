import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Animated, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, ActivityIndicator, Surface } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../components/AuthContext';
import { BlurView } from 'expo-blur';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fadeAnim] = useState(new Animated.Value(0));
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)/PrescriptionsScreen');
    }
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
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
    <LinearGradient colors={["#4c669f", "#3b5998", "#192f6a"]} style={styles.gradient}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <Surface style={styles.surface} elevation={4}>
            <BlurView intensity={20} style={styles.blurContainer}>
              <Text variant="headlineMedium" style={styles.title}>AI Prescription Saathi</Text>
              <Text variant="titleMedium" style={styles.subtitle}>Login to your account</Text>
              
              <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                mode="outlined"
                left={<TextInput.Icon icon="email" />}
              />
              
              <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                style={styles.input}
                secureTextEntry
                mode="outlined"
                left={<TextInput.Icon icon="lock" />}
              />
              
              {error ? (
                <Text style={styles.errorText}>{error}</Text>
              ) : null}
              
              <Button 
                mode="contained" 
                style={styles.button} 
                onPress={handleLogin} 
                disabled={loading} 
                contentStyle={styles.buttonContent}
                icon="login"
              >
                Login
              </Button>
              
              <View style={styles.linkContainer}>
                <Button 
                  mode="text" 
                  onPress={() => router.push('./ForgotPasswordScreen')} 
                  style={styles.textButton}
                  labelStyle={styles.textButtonLabel}
                >
                  Forgot Password?
                </Button>
                <Button 
                  mode="text" 
                  onPress={() => router.push('./RegisterScreen')} 
                  style={styles.textButton}
                  labelStyle={styles.textButtonLabel}
                >
                  Register
                </Button>
              </View>
              
              <Button 
                mode="contained" 
                style={[styles.button, styles.devButton]} 
                onPress={async () => {
                  setLoading(true);
                  setError('');
                  const result = await login('bejobe9275@miracle3.com', 'bejobe9275');
                  if (result.error) setError(result.error);
                  setLoading(false);
                }} 
                disabled={loading} 
                contentStyle={styles.buttonContent}
                icon="account"
              >
                Developer Login
              </Button>
              
              {loading && (
                <ActivityIndicator 
                  style={styles.progress} 
                  size="large" 
                  color="#3b5998"
                />
              )}
            </BlurView>
          </Surface>
        </Animated.View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { 
    flex: 1,
  },
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    padding: 24 
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  surface: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  blurContainer: {
    padding: 24,
  },
  title: { 
    textAlign: 'center', 
    marginBottom: 8, 
    color: '#fff',
    fontWeight: 'bold',
  },
  subtitle: { 
    textAlign: 'center', 
    marginBottom: 24, 
    color: '#fff',
    opacity: 0.8,
  },
  input: { 
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  button: { 
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
  },
  devButton: {
    backgroundColor: '#666',
    marginTop: 16,
  },
  buttonContent: { 
    height: 48,
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  textButton: { 
    marginTop: 8,
  },
  textButtonLabel: { 
    color: '#fff', 
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  progress: { 
    marginTop: 24,
  },
  errorText: {
    color: '#ff4444',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: 'bold',
  },
}); 