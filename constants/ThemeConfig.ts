import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';
import { DarkTheme as NavigationDarkTheme, DefaultTheme as NavigationDefaultTheme } from '@react-navigation/native';

// Primary brand colors
const primaryLight = '#4c669f';
const primaryDark = '#738DCC';

// Custom Paper Light Theme
export const PaperLightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: primaryLight,
    secondary: '#5D85D1',
    tertiary: '#54BD76',
    error: '#D32F2F',
    background: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceVariant: '#F4F6FA',
    text: '#11181C',
    onSurface: '#1A1A1A',
  }
};

// Custom Paper Dark Theme
export const PaperDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: primaryDark,
    secondary: '#90A8E0',
    tertiary: '#7FDFA1',
    error: '#EF5350',
    background: '#121212',
    surface: '#1E1E1E',
    surfaceVariant: '#2C2C2C',
    text: '#ECEDEE',
    onSurface: '#E0E0E0',
  }
};

// Custom Navigation Light Theme
export const CustomNavigationLightTheme = {
  ...NavigationDefaultTheme,
  colors: {
    ...NavigationDefaultTheme.colors,
    primary: primaryLight,
    background: '#FFFFFF',
    card: '#FFFFFF',
    text: '#11181C',
    border: '#E0E0E0',
    notification: '#FF4081',
  }
};

// Custom Navigation Dark Theme
export const CustomNavigationDarkTheme = {
  ...NavigationDarkTheme,
  colors: {
    ...NavigationDarkTheme.colors,
    primary: primaryDark,
    background: '#121212',
    card: '#1E1E1E',
    text: '#ECEDEE',
    border: '#404040',
    notification: '#FF4081',
  }
};

// Gradient colors for various UI elements
export const gradientColors = {
  light: {
    header: ["#4c669f", "#3b5998", "#192f6a"],
    content: ["#e0f7fa", "#f5f5f5", "#e3f2fd"],
    action: ["#4c669f", "#3b5998", "#192f6a"],
    card: ["#ffffff", "#f8f9fa", "#f0f4f8"],
    emptyIcon: ["#e1f5fe", "#b3e5fc"],
  },
  dark: {
    header: ["#2A3A64", "#1D2951", "#121836"],
    content: ["#121212", "#1A1A1A", "#1F1F1F"],
    action: ["#3A4C7A", "#2A3A64", "#1D2951"],
    card: ["#1E1E1E", "#252525", "#2A2A2A"],
    emptyIcon: ["#2A2A2A", "#333333"],
  }
}; 