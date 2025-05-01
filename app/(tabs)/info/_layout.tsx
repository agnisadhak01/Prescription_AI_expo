import { Stack } from 'expo-router';
import React from 'react';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function InfoLayout() {
  const colorScheme = useColorScheme();

  return (
    <Stack
      screenOptions={{
        headerTintColor: colorScheme === 'dark' ? '#fff' : '#000',
        headerStyle: {
          backgroundColor: colorScheme === 'dark' ? '#121212' : '#fff',
        },
        headerShown: true,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Information',
        }}
      />
      <Stack.Screen
        name="terms-of-service"
        options={{
          title: 'Terms of Service',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="privacy-policy"
        options={{
          title: 'Privacy Policy',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="about"
        options={{
          title: 'About Us',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="medical-disclaimer"
        options={{
          title: 'Medical Disclaimer',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="contact"
        options={{
          title: 'Contact Support',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="debug"
        options={{
          title: 'Navigation Debug',
          headerBackTitle: 'Back',
        }}
      />
    </Stack>
  );
} 