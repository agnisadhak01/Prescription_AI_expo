import React from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, Redirect, Slot, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import 'react-native-url-polyfill/auto';
import { LogBox, View, Text, Modal, Alert } from 'react-native';
import { Button } from 'react-native-paper';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { AuthProvider, useAuth } from '@/components/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import LoadingScreen from '../components/LoadingScreen/LoadingScreen';
import Constants from 'expo-constants';

// Suppress the TextInput.Icon defaultProps warning
LogBox.ignoreLogs([
  'TextInput.Icon: Support for defaultProps will be removed from function components in a future major release',
]);

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('@/assets/fonts/SpaceMono-Regular.ttf'),
  });

  // console.log("Font loaded:", loaded, "Error:", error);

  useEffect(() => {
    if (error) {
      console.error("Font loading error:", error);
    }
  }, [error]);

  const colorScheme = useColorScheme();

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Preview badge logic
  const isPreview =
    process.env.EXPO_PUBLIC_PREVIEW_BUILD === 'true' ||
    (Constants?.expoConfig?.extra?.preview === true);

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <Text style={{ color: 'red' }}>Font failed to load.</Text>
      </View>
    );
  }

  if (!loaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <Text>Loading fonts...</Text>
      </View>
    );
  }

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        {/* PREVIEW BADGE (global, floating) */}
        {isPreview && (
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: 40,
              right: 16,
              zIndex: 9999,
              backgroundColor: 'rgba(255, 69, 58, 0.85)',
              borderRadius: 8,
              paddingHorizontal: 14,
              paddingVertical: 6,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 6,
            }}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold', letterSpacing: 1.2, fontSize: 14 }}>
              PREVIEW
            </Text>
          </View>
        )}
        <RootLayoutNav />
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}

function RootLayoutNav() {
  const { user, loading, isEmailVerified, resendVerificationEmail } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [showVerifyModal, setShowVerifyModal] = React.useState(false);
  
  React.useEffect(() => {
    if (loading) return;

    // Check if we're on a protected route
    const inProtectedGroup = segments[0] === '(tabs)';
    const inAuthGroup = segments[0] === 'LoginScreen' || segments[0] === 'RegisterScreen' || segments[0] === 'ForgotPasswordScreen';
    const onVerifyScreen = segments[0] === 'screens' && segments[1] === 'VerifyOTPScreen';

    if (!user && inProtectedGroup) {
      // If user not signed in but trying to access a protected route, redirect to login
      router.replace('/LoginScreen');
    } else if (user && inAuthGroup) {
      // If user is signed in but on an auth route, redirect to main app
      router.replace('/');
    }

    // If user is logged in but email is not verified, show modal and redirect
    if (user && !isEmailVerified && !onVerifyScreen) {
      setShowVerifyModal(true);
      // Redirect to VerifyOTPScreen
      router.replace('/screens/VerifyOTPScreen');
    } else {
      setShowVerifyModal(false);
    }
  }, [user, segments, loading, isEmailVerified, router]);

  if (loading) {
    return <LoadingScreen />;
  }

  // Email verification modal
  const EmailVerificationModal = () => (
    <Modal
      visible={showVerifyModal}
      animationType="slide"
      transparent
    >
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 24, width: '85%', maxWidth: 400, alignItems: 'center' }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 12, color: '#d9534f', textAlign: 'center' }}>Email Not Verified</Text>
          <Text style={{ fontSize: 16, marginBottom: 20, textAlign: 'center' }}>
            Please verify your email address to continue using the app. Check your inbox for a verification link.
          </Text>
          <Button
            mode="contained"
            icon="email-alert"
            style={{ marginBottom: 12, width: '100%' }}
            onPress={async () => {
              const result = await resendVerificationEmail();
              if (result?.error) {
                Alert.alert('Error', result.error);
              } else {
                Alert.alert('Verification Email Sent', 'A new verification email has been sent to your inbox.');
              }
            }}
          >
            Resend Verification Email
          </Button>
          <Button
            mode="outlined"
            style={{ width: '100%' }}
            onPress={() => {
              setShowVerifyModal(false);
              router.replace('/screens/VerifyOTPScreen');
            }}
          >
            Go to Verification Screen
          </Button>
        </View>
      </View>
    </Modal>
  );

  // If user is authenticated, show the main app layout
  if (user) {
    return (
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <EmailVerificationModal />
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="screens/ProcessingResultScreen" options={{ headerShown: false, presentation: 'modal' }} />
          <Stack.Screen name="screens/CameraScreen" options={{ headerShown: false }} />
          <Stack.Screen name="screens/SubscriptionScreen" options={{ headerShown: false }} />
          <Stack.Screen name="screens/VerifyOTPScreen" options={{ headerShown: false }} />
          <Stack.Screen name="screens/PrivacyPolicyScreen" options={{ headerShown: true }} />
          <Stack.Screen name="screens/TermsOfServiceScreen" options={{ headerShown: true }} />
        </Stack>
      </ThemeProvider>
    );
  }

  // Non-authenticated users see the auth screens
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LoginScreen" />
      <Stack.Screen name="RegisterScreen" />
      <Stack.Screen name="ForgotPasswordScreen" />
      <Stack.Screen name="screens/SubscriptionScreen" />
      <Stack.Screen name="screens/VerifyOTPScreen" />
      <Stack.Screen name="screens/PrivacyPolicyScreen" options={{ headerShown: true }} />
      <Stack.Screen name="screens/TermsOfServiceScreen" options={{ headerShown: true }} />
      <Stack.Screen name="index" redirect={true} />
      <Stack.Screen name="(tabs)" redirect={true} />
    </Stack>
  );
}
