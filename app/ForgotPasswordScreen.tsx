import React, { useState, useEffect } from 'react';
import { StyleSheet, Animated, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, ActivityIndicator, Surface } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { supabase } from '../components/supabaseClient';
import { useTheme as usePaperTheme } from 'react-native-paper';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [fadeAnim] = useState(new Animated.Value(0));
  const router = useRouter();
  const paperTheme = usePaperTheme();
  const isDark = paperTheme.dark;
  const inputBackground = isDark ? 'rgba(30,30,30,0.95)' : 'rgba(255,255,255,0.9)';

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleReset = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    const redirectTo = 'prescriptionai://reset-password';
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo
    });
    if (error) {
      setError(error.message);
    } else {
      setMessage('Password reset email sent! Check your inbox.');
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
              <Text variant="headlineMedium" style={styles.title}>Reset Password</Text>
              <Text variant="bodyMedium" style={styles.description}>
                Enter your email address and we&apos;ll send you a link to reset your password.
              </Text>
              
              <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                style={[styles.input, { 
                  backgroundColor: inputBackground,
                  fontSize: 16,
                  paddingLeft: 50,
                }]}
                keyboardType="email-address"
                autoCapitalize="none"
                mode="outlined"
                left={<TextInput.Icon icon="email" />}
                textColor={isDark ? '#ffffff' : '#000000'}
              />
              
              {error ? (
                <Text style={styles.errorText}>{error}</Text>
              ) : null}
              
              {message ? (
                <Text style={styles.successText}>{message}</Text>
              ) : null}
              
              <Button 
                mode="contained" 
                style={styles.button} 
                onPress={handleReset} 
                disabled={loading}
                contentStyle={styles.buttonContent}
                icon="email-send"
              >
                Send Reset Email
              </Button>
              
              <Button 
                mode="text" 
                onPress={() => router.replace('/LoginScreen')} 
                style={styles.link}
                labelStyle={styles.linkLabel}
                icon="arrow-left"
              >
                Back to Login
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
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
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
    marginBottom: 16, 
    color: '#fff',
    fontWeight: 'bold',
  },
  description: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#fff',
    opacity: 0.8,
  },
  input: { 
    marginBottom: 16,
    height: 56,
  },
  button: { 
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
  },
  buttonContent: { 
    height: 48,
  },
  link: { 
    marginTop: 16,
  },
  linkLabel: {
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
  successText: {
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: 'bold',
  },
}); 