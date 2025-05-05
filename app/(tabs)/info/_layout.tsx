import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { useColorScheme } from '@/hooks/useColorScheme';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function InfoLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  // Custom back button component
  const CustomBackButton = () => (
    <TouchableOpacity 
      onPress={() => router.back()}
      style={{ marginLeft: 8, padding: 8 }}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Ionicons 
        name="arrow-back" 
        size={24} 
        color={colorScheme === 'dark' ? '#fff' : '#000'} 
      />
    </TouchableOpacity>
  );

  return (
    <Stack
      screenOptions={{
        headerTintColor: colorScheme === 'dark' ? '#fff' : '#000',
        headerStyle: {
          backgroundColor: colorScheme === 'dark' ? '#121212' : '#fff',
        },
        headerShown: true,
        headerLeft: () => <CustomBackButton />,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Information',
          headerLeft: () => null, // No back button on main info screen
        }}
      />
      <Stack.Screen
        name="terms-of-service"
        options={{
          title: 'Terms of Service',
          headerBackVisible: false, // Hide default back button
        }}
      />
      <Stack.Screen
        name="privacy-policy"
        options={{
          title: 'Privacy Policy',
          headerBackVisible: false, // Hide default back button
        }}
      />
      <Stack.Screen
        name="about"
        options={{
          title: 'About Us',
          headerBackVisible: false, // Hide default back button
        }}
      />
      <Stack.Screen
        name="medical-disclaimer"
        options={{
          title: 'Medical Disclaimer',
          headerBackVisible: false, // Hide default back button
        }}
      />
      <Stack.Screen
        name="contact"
        options={{
          title: 'Contact Support',
          headerBackVisible: false, // Hide default back button
        }}
      />
      <Stack.Screen
        name="debug"
        options={{
          title: 'Navigation Debug',
          headerBackVisible: false, // Hide default back button
        }}
      />
    </Stack>
  );
} 