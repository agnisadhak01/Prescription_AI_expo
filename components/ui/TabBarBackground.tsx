// TabBarBackground.tsx - cross-platform shim for tab bar background
// @jsxImportSource react
import * as React from 'react';
import { View } from 'react-native'; // This import is correct for React Native projects

export default function TabBarBackground() {
  return <View />;
}

export function useBottomTabOverflow() {
  return 0;
}
