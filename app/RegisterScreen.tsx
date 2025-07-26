import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Animated, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { TextInput, Button, Text, ActivityIndicator, Surface, Checkbox, Divider, useTheme as usePaperTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useAuth } from '../components/AuthContext';
import { GradientText } from '../components/GradientText';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [termsAccepted, setTermsAccepted] = useState(false);
  const router = useRouter();
  const { register, loginWithGoogle } = useAuth();
  const paperTheme = usePaperTheme();
  const isDark = paperTheme.dark;
  const inputBackground = isDark ? 'rgba(30,30,30,0.95)' : 'rgba(255,255,255,0.9)';
  const googleButtonBackground = isDark ? '#23272e' : 'white';

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleRegister = async () => {
    setError('');
    if (!name || !email || !password || !confirmPassword) {
      setError('All fields are required.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!termsAccepted) {
      setError('You must accept the Terms of Service and Privacy Policy to register.');
      return;
    }
    setLoading(true);
    const result = await register(name, email, password);
    if (result.error) {
      setError(result.error);
    } else {
      Alert.alert(
        'Registration Successful',
        'Please check your email for the verification link and OTP code.',
        [{ text: 'OK', onPress: () => router.replace('/screens/VerifyOTPScreen') }]
      );
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Automatically accept terms when using Google Sign-In
      if (!termsAccepted) {
        setTermsAccepted(true);
      }
      
      const result = await loginWithGoogle();
      if (result?.error) {
        setError(result.error);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during Google Sign-In. Please try again.');
      console.error('Google Sign-In error:', err);
    } finally {
      setLoading(false);
    }
  };

  const navigateToTerms = () => {
    router.push('/screens/TermsOfServiceScreen');
  };

  const navigateToPrivacy = () => {
    router.push('/screens/PrivacyPolicyScreen');
  };

  return (
    <LinearGradient colors={["#4c669f", "#3b5998", "#192f6a"]} style={styles.gradient}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
            <Surface style={styles.surface} elevation={4}>
              <BlurView intensity={20} style={styles.blurContainer}>
                <Text variant="headlineMedium" style={styles.title}>AI Prescription Saathi</Text>
                <Text variant="titleMedium" style={styles.subtitle}>Create a new account</Text>
                
                {/* Google Sign-In Button - At the top for visibility */}
                <Button 
                  mode="outlined" 
                  style={[styles.googleButton, { backgroundColor: googleButtonBackground }]} 
                  onPress={handleGoogleSignIn} 
                  disabled={loading}
                  contentStyle={[styles.buttonContent, { justifyContent: 'flex-start' }]}
                  icon={undefined}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                    <GradientText 
                      fontSize={16} 
                      fontWeight="bold">
                      Sign up with
                    </GradientText>
                    <Text style={{ fontWeight: 'bold', fontSize: 18, marginLeft: 8 }}>
                      <Text style={{ color: '#4285F4' }}>G</Text>
                      <Text style={{ color: '#EA4335' }}>o</Text>
                      <Text style={{ color: '#FBBC05' }}>o</Text>
                      <Text style={{ color: '#4285F4' }}>g</Text>
                      <Text style={{ color: '#34A853' }}>l</Text>
                      <Text style={{ color: '#EA4335' }}>e</Text>
                    </Text>
                  </View>
                </Button>
                
                {/* Divider with "or" text */}
                <View style={styles.dividerContainer}>
                  <Divider style={styles.divider} />
                  <Text style={styles.dividerText}>or</Text>
                  <Divider style={styles.divider} />
                </View>
                
                <TextInput
                  label="Full Name"
                  value={name}
                  onChangeText={setName}
                  style={[styles.input, { 
                    backgroundColor: inputBackground,
                    fontSize: 16,
                    paddingLeft: 50,
                  }]}
                  mode="outlined"
                  left={<TextInput.Icon icon="account" />}
                  textColor={isDark ? '#ffffff' : '#000000'}
                />
                
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
                
                <TextInput
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  style={[styles.input, { 
                    backgroundColor: inputBackground,
                    fontSize: 16,
                    paddingLeft: 50,
                  }]}
                  secureTextEntry
                  mode="outlined"
                  left={<TextInput.Icon icon="lock" />}
                  textColor={isDark ? '#ffffff' : '#000000'}
                />
                
                <TextInput
                  label="Confirm Password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  style={[styles.input, { 
                    backgroundColor: inputBackground,
                    fontSize: 16,
                    paddingLeft: 50,
                  }]}
                  secureTextEntry
                  mode="outlined"
                  left={<TextInput.Icon icon="lock-check" />}
                  textColor={isDark ? '#ffffff' : '#000000'}
                />
                
                {/* Terms and Privacy Checkbox */}
                <View style={styles.termsContainer}>
                  <Checkbox
                    status={termsAccepted ? 'checked' : 'unchecked'}
                    onPress={() => setTermsAccepted(!termsAccepted)}
                    color="#ffffff"
                  />
                  <View style={styles.termsTextContainer}>
                    <Text style={styles.termsText}>
                      I accept the{' '}
                      <Text style={styles.termsLink} onPress={navigateToTerms}>
                        Terms of Service
                      </Text>
                      {' '}and{' '}
                      <Text style={styles.termsLink} onPress={navigateToPrivacy}>
                        Privacy Policy
                      </Text>
                    </Text>
                  </View>
                </View>
                
                {error ? (
                  <Text style={styles.errorText}>{error}</Text>
                ) : null}
                
                <Button 
                  mode="contained" 
                  style={styles.button} 
                  onPress={handleRegister} 
                  disabled={loading}
                  contentStyle={styles.buttonContent}
                  icon="account-plus"
                >
                  Register
                </Button>
                
                <Button 
                  mode="text" 
                  onPress={() => router.push('./LoginScreen')} 
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
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
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
    height: 56,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  termsTextContainer: {
    flex: 1,
    marginLeft: 8,
  },
  termsText: {
    color: '#fff',
    fontSize: 14,
  },
  termsLink: {
    color: '#fff',
    textDecorationLine: 'underline',
    fontWeight: 'bold',
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
    color: '#ff6b6b',
    textAlign: 'center',
    marginBottom: 16,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  divider: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.5)',
    height: 1,
  },
  dividerText: {
    color: '#fff',
    paddingHorizontal: 16,
    fontSize: 14,
  },
  googleButton: {
    marginBottom: 8,
    borderColor: '#dadce0',
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: 'rgba(0,0,0,0.2)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
  },
}); 