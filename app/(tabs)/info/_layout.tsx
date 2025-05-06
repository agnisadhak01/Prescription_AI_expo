import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';

export default function InfoLayout() {
  const { colors } = useTheme();
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
        color={colors.text} 
      />
    </TouchableOpacity>
  );

  return (
    <Stack
      screenOptions={{
        headerTintColor: colors.text,
        headerStyle: {
          backgroundColor: colors.background,
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