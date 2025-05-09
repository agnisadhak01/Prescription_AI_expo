import { Stack, useRouter, useSegments } from 'expo-router';
import React, { useCallback } from 'react';
import { TouchableOpacity, BackHandler, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';

// Custom back button for child screens
function CustomBackButton({ onPress, color }: { onPress: () => void; color: string }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{ marginLeft: 8, padding: 8 }}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Ionicons name="arrow-back" size={24} color={color} />
    </TouchableOpacity>
  );
}

export default function InfoLayout() {
  const { colors } = useTheme();
  const router = useRouter();
  const segments = useSegments();

  // Handler to always go to Info main page
  const goToInfoMain = useCallback(() => {
    router.replace('/(tabs)/info');
  }, [router]);

  // Centralized hardware back handler for child pages only
  useFocusEffect(
    useCallback(() => {
      // Only apply on child pages (segments: ['(tabs)', 'info', ...])
      if (segments.length > 2 && segments[0] === '(tabs)' && segments[1] === 'info') {
        const onBackPress = () => {
          router.replace('/(tabs)/info');
          return true;
        };
        if (Platform.OS === 'android') {
          BackHandler.addEventListener('hardwareBackPress', onBackPress);
          return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
        }
      }
      // On index, do not override hardware back
      return;
    }, [router, segments])
  );

  // Helper to wrap child screens with custom back button
  function childScreenOptions(title: string) {
    return {
      title,
      headerLeft: () => <CustomBackButton onPress={goToInfoMain} color={colors.text} />,
    };
  }

  return (
    <Stack
      screenOptions={{
        headerTintColor: colors.text,
        headerStyle: { backgroundColor: colors.background },
        headerShown: true,
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
        options={childScreenOptions('Terms of Service')}
      />
      <Stack.Screen
        name="privacy-policy"
        options={childScreenOptions('Privacy Policy')}
      />
      <Stack.Screen
        name="about"
        options={childScreenOptions('About Us')}
      />
      <Stack.Screen
        name="medical-disclaimer"
        options={childScreenOptions('Medical Disclaimer')}
      />
      <Stack.Screen
        name="contact"
        options={childScreenOptions('Contact Support')}
      />
    </Stack>
  );
} 