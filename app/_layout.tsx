import React from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, Redirect, Slot, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import 'react-native-url-polyfill/auto';
import { LogBox, View, Text } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { AuthProvider, useAuth } from '@/components/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import LoadingScreen from '../components/LoadingScreen/LoadingScreen';

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
        <RootLayoutNav />
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (loading) return;

    // Check if we're on a protected route
    const inProtectedGroup = segments[0] === '(tabs)';
    const inAuthGroup = segments[0] === 'LoginScreen' || segments[0] === 'RegisterScreen' || segments[0] === 'ForgotPasswordScreen';

    if (!user && inProtectedGroup) {
      // If user not signed in but trying to access a protected route, redirect to login
      router.replace('/LoginScreen');
    } else if (user && inAuthGroup) {
      // If user is signed in but on an auth route, redirect to main app
      router.replace('/');
    }
  }, [user, segments, loading, router]);

  if (loading) {
    return <LoadingScreen />;
  }

  // If user is authenticated, show the main app layout
  if (user) {
    return (
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="screens/ProcessingResultScreen" options={{ headerShown: false, presentation: 'modal' }} />
          <Stack.Screen name="screens/CameraScreen" options={{ headerShown: false }} />
          <Stack.Screen name="screens/SubscriptionScreen" options={{ headerShown: false }} />
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
      <Stack.Screen name="index" redirect={true} />
      <Stack.Screen name="(tabs)" redirect={true} />
    </Stack>
  );
}
