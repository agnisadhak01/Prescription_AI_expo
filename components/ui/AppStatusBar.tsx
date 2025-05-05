import React from 'react';
import { StatusBar, Platform, View, StyleSheet } from 'react-native';

// A component to render a safe area for the status bar
export const AppStatusBar = () => {
  return (
    <View style={styles.statusBarContainer}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#4c669f"
        translucent={true}
      />
    </View>
  );
};

// A helper function to get the status bar height
export const getStatusBarHeight = (): number => {
  return Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0;
};

// A helper function to get padding for header containers
export const getHeaderPadding = (additionalPadding: number = 16): number => {
  return getStatusBarHeight() + additionalPadding;
};

const styles = StyleSheet.create({
  statusBarContainer: {
    height: getStatusBarHeight(),
    backgroundColor: '#4c669f',
  },
}); 