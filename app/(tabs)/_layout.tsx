import { Tabs, useRouter } from 'expo-router';
import React, { useCallback, useEffect } from 'react';
import { Platform, StatusBar } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Feather } from '@expo/vector-icons';
import BackHandlerWithExit from '@/components/ui/BackHandlerWithExit';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  // Function to handle tab press and ensure correct navigation behavior
  const handleTabPress = useCallback((route) => {
    if (route === 'info') {
      // Always navigate to the root of the info tab as a replace operation
      router.replace('/(tabs)/info');
      return true; // Return true to indicate we handled it
    }
    return false; // Return false to let default behavior handle it
  }, [router]);

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#4c669f"
        translucent={true}
      />
      <BackHandlerWithExit />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,
          tabBarStyle: Platform.select({
            ios: {
              position: 'absolute',
            },
            default: {},
          }),
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Prescriptions',
            tabBarIcon: ({ color }) => <Feather name="home" size={24} color={color} />,
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="ProfileScreen"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => <Feather name="user" size={24} color={color} />,
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="info"
          options={{
            title: 'Info',
            tabBarIcon: ({ color }) => <Feather name="info" size={24} color={color} />,
            headerShown: false,
            // Special handler for the info tab
            listeners: {
              tabPress: (e) => {
                // Prevent default behavior
                e.preventDefault();
                // Handle with our custom function
                handleTabPress('info');
              }
            }
          }}
        />
      </Tabs>
    </>
  );
}
