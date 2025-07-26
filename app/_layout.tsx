import React, { useEffect } from 'react';
import { ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';
import 'react-native-url-polyfill/auto';
import { LogBox, View, Text, Modal, Alert, AppState } from 'react-native';
import { Button, Provider as PaperProvider } from 'react-native-paper';
import { AuthProvider, useAuth } from '@/components/AuthContext';
import { NotificationProvider } from '@/components/NotificationContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import LoadingScreen from '@/components/LoadingScreen/LoadingScreen.native';
import { ForceUpdateChecker } from '@/components/ForceUpdateChecker';
import * as SecureStore from 'expo-secure-store';
import { PaperLightTheme, PaperDarkTheme, CustomNavigationLightTheme, CustomNavigationDarkTheme } from '@/constants/ThemeConfig';

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

  useEffect(() => {
    if (error) {
      console.error("Font loading error:", error);
    }
  }, [error]);

  const colorScheme = useColorScheme();
  const paperTheme = colorScheme === 'dark' ? PaperDarkTheme : PaperLightTheme;
  const navigationTheme = colorScheme === 'dark' ? CustomNavigationDarkTheme : CustomNavigationLightTheme;

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Clear navigation state on cold start to prevent ScreenStackFragment errors
  useEffect(() => {
    const clearNavigationCache = async () => {
      try {
        // Check if this is a fresh app start or resume
        const lastActiveTime = await SecureStore.getItemAsync('app_last_active');
        const currentTime = Date.now().toString();
        
        // If no last active time or it was more than 5 minutes ago, clear navigation state
        if (!lastActiveTime || (parseInt(currentTime) - parseInt(lastActiveTime) > 5 * 60 * 1000)) {
          await SecureStore.deleteItemAsync('navigation-state');
          console.log('Navigation state cleared on cold start');
        }
        
        // Update the last active time
        await SecureStore.setItemAsync('app_last_active', currentTime);
      } catch (error) {
        console.error('Failed to clear navigation cache:', error);
      }
    };
    
    clearNavigationCache();
    
    // Also track app state to detect background/foreground transitions
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        SecureStore.setItemAsync('app_last_active', Date.now().toString());
      }
    });
    
    return () => {
      subscription.remove();
    };
  }, []);

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
      <NotificationProvider>
        <PaperProvider theme={paperTheme}>
          <ThemeProvider value={navigationTheme}>
            <RootLayoutNav />
          </ThemeProvider>
        </PaperProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

// Example usage of insets in a main container (for your screens/components):
// import { useEdgeToEdgeInsets } from 'react-native-edge-to-edge';
// function MainScreen() {
//   const insets = useEdgeToEdgeInsets();
//   return (
//     <View style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom }}>
//       {/* ... */}
//     </View>
//   );
// }

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

    // If user is logged in but email is not verified, show modal and redirect to verify page
    if (user && !isEmailVerified && !onVerifyScreen) {
      setShowVerifyModal(true);
      // Short delay to ensure modal is visible before navigation
      setTimeout(() => {
        router.replace('/screens/VerifyOTPScreen');
      }, 300);
    } else if (user && isEmailVerified && onVerifyScreen) {
      // If user is verified but still on verify screen, redirect to main app
      router.replace('/');
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
      <ForceUpdateChecker>
        <ThemeProvider value={colorScheme === 'dark' ? CustomNavigationDarkTheme : CustomNavigationLightTheme}>
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
      </ForceUpdateChecker>
    );
  }

  // Non-authenticated users see the auth screens
  return (
    <ForceUpdateChecker>
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
    </ForceUpdateChecker>
  );
}
