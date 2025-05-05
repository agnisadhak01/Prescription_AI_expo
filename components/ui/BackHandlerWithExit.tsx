import React, { useEffect, useRef } from 'react';
import { BackHandler, ToastAndroid, Platform } from 'react-native';
import { useFocusEffect } from 'expo-router';

/**
 * A custom hook that adds double-back-to-exit functionality
 * When user presses back button twice within a specified timeframe, the app will exit
 * Otherwise, a toast message is shown
 */
export function useBackHandlerWithExit() {
  const backPressedOnce = useRef(false);
  const backPressTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        // This only applies to Android
        if (Platform.OS !== 'android') return false;

        // If this is the first back press
        if (!backPressedOnce.current) {
          backPressedOnce.current = true;
          ToastAndroid.show('Press back again to exit', ToastAndroid.SHORT);
          
          // Reset after 3 seconds
          backPressTimeoutRef.current = setTimeout(() => {
            backPressedOnce.current = false;
          }, 3000);
          
          return true; // Prevent default behavior (exit)
        } else {
          // Second back press within timeframe - exit the app
          BackHandler.exitApp();
          return true;
        }
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => {
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
        // Clear any existing timeout when unmounting
        if (backPressTimeoutRef.current) {
          clearTimeout(backPressTimeoutRef.current);
        }
      };
    }, [])
  );
}

/**
 * Component that wraps the hook for easier use in component trees
 */
export default function BackHandlerWithExit() {
  useBackHandlerWithExit();
  return null;
} 