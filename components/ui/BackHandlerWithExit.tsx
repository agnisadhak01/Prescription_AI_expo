import React, { useEffect, useRef } from 'react';
import { BackHandler, ToastAndroid, Platform } from 'react-native';
import { useFocusEffect, usePathname } from 'expo-router';

/**
 * A custom hook that adds double-back-to-exit functionality
 * When user presses back button twice within a specified timeframe, the app will exit
 * Otherwise, a toast message is shown
 * 
 * This behavior only activates on main tab screens, not on nested screens
 */
export function useBackHandlerWithExit() {
  const backPressedOnce = useRef(false);
  const backPressTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();
  
  // Only enable double-back-to-exit on main tab screens
  // Main tab paths are "/", "/ProfileScreen", and "/info"
  const isMainTabScreen = 
    pathname === '/' || 
    pathname === '/ProfileScreen' || 
    pathname === '/info';

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        // This only applies to Android and only on main tab screens
        if (Platform.OS !== 'android' || !isMainTabScreen) return false;

        // If this is the first back press
        if (!backPressedOnce.current) {
          backPressedOnce.current = true;
          ToastAndroid.show('Press back again to exit PrescriptionAI', ToastAndroid.SHORT);
          
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
    }, [isMainTabScreen, pathname])
  );
}

/**
 * Component that wraps the hook for easier use in component trees
 */
export default function BackHandlerWithExit() {
  useBackHandlerWithExit();
  return null;
} 