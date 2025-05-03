import React from 'react';
import { Text, TextProps, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface GradientTextProps extends TextProps {
  colors?: [string, string, ...string[]]; // At least two colors required
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  children: React.ReactNode;
}

const DEFAULT_COLORS: [string, string, ...string[]] = ['#4285F4', '#34A853', '#FBBC05', '#EA4335'];

export const GradientText: React.FC<GradientTextProps> = ({
  colors = DEFAULT_COLORS,
  start = { x: 0, y: 0 },
  end = { x: 1, y: 0 },
  style,
  children,
  ...props
}) => {
  // Very simple gradient background with white text - this is the most reliable
  // approach for gradient "text" on React Native
  return (
    <LinearGradient
      colors={colors}
      start={start}
      end={end}
      style={{ alignSelf: 'flex-start', borderRadius: 5 }}
    >
      <Text 
        {...props}
        style={[
          style, 
          { 
            backgroundColor: 'transparent',
            paddingHorizontal: 3,
            color: 'white',
          }
        ]}
      >
        {children}
      </Text>
    </LinearGradient>
  );
}; 