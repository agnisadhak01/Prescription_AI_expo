import { Stack, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { TouchableOpacity, BackHandler } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';

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


  // Restore proper back handler for child pages - always go to Info main page
  useEffect(() => {
    const onBackPress = () => {
      router.replace('/(tabs)/info');
      return true;
    };
    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [router]);

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
          headerLeft: () => null,
        }}
      />
      <Stack.Screen
        name="terms-of-service"
        options={{ title: 'Terms of Service' }}
      />
      <Stack.Screen
        name="privacy-policy"
        options={{ title: 'Privacy Policy' }}
      />
      <Stack.Screen
        name="about"
        options={{ title: 'About Us' }}
      />
      <Stack.Screen
        name="medical-disclaimer"
        options={{ title: 'Medical Disclaimer' }}
      />
      <Stack.Screen
        name="contact"
        options={{ title: 'Contact Support' }}
      />
    </Stack>
  );
} 