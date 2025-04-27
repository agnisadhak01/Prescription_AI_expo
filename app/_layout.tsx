import React from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, Redirect, Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import 'react-native-url-polyfill/auto';
import { LogBox, View, Text } from 'react-native';

// Suppress the TextInput.Icon defaultProps warning
LogBox.ignoreLogs([
  'TextInput.Icon: Support for defaultProps will be removed from function components in a future major release',
]);

import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthProvider, useAuth } from '../components/AuthContext';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
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
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Text style={{ color: '#4c669f', fontSize: 18 }}>Checking authentication...</Text>
      </View>
    );
  }

  // Authenticated users see the tabs screens
  if (isAuthenticated) {
    return <Slot />;
  }
  
  // Non-authenticated users see the auth screens
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LoginScreen" />
      <Stack.Screen name="RegisterScreen" />
      <Stack.Screen name="ForgotPasswordScreen" />
      <Stack.Screen name="index" redirect={true} />
      <Stack.Screen name="(tabs)" redirect={true} />
    </Stack>
  );
}
