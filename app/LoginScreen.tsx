import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Animated, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, ActivityIndicator, Surface, Divider } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../components/AuthContext';
import { BlurView } from 'expo-blur';
import { GradientText } from '../components/GradientText';
import { useTheme as usePaperTheme } from 'react-native-paper';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  const [error, setError] = useState('');
  const [fadeAnim] = useState(new Animated.Value(0));
  const router = useRouter();
  const { login, isAuthenticated, loading: authLoading, loginWithGoogle } = useAuth();
  const paperTheme = usePaperTheme();
  const isDark = paperTheme.dark;
  const inputBackground = isDark ? 'rgba(30,30,30,0.95)' : 'rgba(255,255,255,0.9)';
  const googleButtonBackground = isDark ? '#23272e' : 'white';

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      router.replace('/(tabs)');
    }
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [isAuthenticated, authLoading]);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    try {
      setLocalLoading(true);
      setError('');
      const result = await login(email, password);
      if (result?.error) {
        setError(result.error);
      }
    } catch (err) {
      setError('An error occurred during login. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLocalLoading(true);
      setError('');
      console.log('Login Screen: Initiating Google Sign-In');
      const result = await loginWithGoogle();
      
      if (result?.error) {
        console.error('Login Screen: Google Sign-In failed:', result.error);
        
        // More user-friendly error message for DEVELOPER_ERROR
        if (result.error.includes('Developer Error') || result.error.includes('SHA-1')) {
          setError('There was a configuration issue with Google Sign-In. Please try again later or contact support.');
        } else {
          setError(result.error);
        }
      }
    } catch (err: any) {
      console.error('Login Screen: Unexpected error during Google Sign-In:', err);
      setError(err.message || 'An error occurred during Google Sign-In. Please try again.');
    } finally {
      setLocalLoading(false);
    }
  };

  if (authLoading) {
    return (
      <LinearGradient colors={["#4c669f", "#3b5998", "#192f6a"]} style={styles.gradient}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </LinearGradient>
    );
  }

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
              
              {error ? (
                <Text style={styles.errorText}>{error}</Text>
              ) : null}
              
              <Button 
                mode="contained" 
                style={styles.button} 
                onPress={handleLogin} 
                disabled={localLoading} 
                contentStyle={styles.buttonContent}
                icon="login"
              >
                Login
              </Button>

              {/* Divider with "or" text */}
              <View style={styles.dividerContainer}>
                <Divider style={styles.divider} />
                <Text style={styles.dividerText}>or</Text>
                <Divider style={styles.divider} />
              </View>
              
              {/* Google Sign-In Button */}
              <Button 
                mode="outlined" 
                style={[styles.googleButton, { backgroundColor: googleButtonBackground }]} 
                onPress={handleGoogleSignIn} 
                disabled={localLoading}
                contentStyle={[styles.buttonContent, { justifyContent: 'flex-start' }]}
                icon={undefined}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                  <GradientText 
                    fontSize={16} 
                    fontWeight="bold">
                    Sign in with
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
              
              {/* Terms and Privacy Policy Links */}
              <View style={styles.termsContainer}>
                <Text style={styles.termsText}>
                  By using this app, you agree to our{' '}
                  <Text 
                    style={styles.termsLink} 
                    onPress={() => router.push('/screens/TermsOfServiceScreen')}
                  >
                    Terms of Service
                  </Text>
                  {' '}and{' '}
                  <Text 
                    style={styles.termsLink} 
                    onPress={() => router.push('/screens/PrivacyPolicyScreen')}
                  >
                    Privacy Policy
                  </Text>
                </Text>
              </View>
              
              {/* Developer Login Button - Commented out for production */}
              {/* 
              <Button 
                mode="contained" 
                style={[styles.button, styles.devButton]} 
                onPress={async () => {
                  setLocalLoading(true);
                  setError('');
                  const result = await login('bejobe9275@miracle3.com', 'bejobe9275');
                  if (result.error) setError(result.error);
                  setLocalLoading(false);
                }} 
                disabled={localLoading} 
                contentStyle={styles.buttonContent}
                icon="account"
              >
                Developer Login
              </Button>
              */}
              
              {localLoading && (
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
    height: 56,
  },
  button: { 
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
  },
  /* Developer button - Commented out for production */
  /*
  devButton: {
    backgroundColor: '#666',
    marginTop: 16,
  },
  */
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#ffffff',
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    color: '#ff6b6b',
    textAlign: 'center',
    marginBottom: 16,
  },
  termsContainer: {
    marginTop: 16,
    marginBottom: 8,
    alignItems: 'center',
  },
  termsText: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
  },
  termsLink: {
    color: '#fff',
    textDecorationLine: 'underline',
    fontWeight: 'bold',
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
    marginBottom: 16,
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