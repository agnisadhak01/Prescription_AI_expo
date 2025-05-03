import React from 'react';
import { Text, TextProps, View, TextStyle, StyleSheet } from 'react-native';

interface GradientTextProps extends TextProps {
  colors?: [string, string, ...string[]];
  fontSize?: number;
  fontWeight?: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  children: React.ReactNode;
}

const DEFAULT_COLORS: [string, string, ...string[]] = ['#4285F4', '#34A853', '#FBBC05', '#EA4335'];

export const GradientText: React.FC<GradientTextProps> = ({
  colors = DEFAULT_COLORS,
  fontSize = 16,
  fontWeight = 'normal',
  style,
  children,
  ...props
}) => {
  // Convert children to string
  const textContent = String(children);
  const textLength = textContent.length;
  
  // Check for empty text
  if (textLength === 0) {
    return null;
  }
  
  // Create segments - divides the text into character spans
  // Each character gets a color interpolated between the gradient colors
  const segments = Array.from(textContent).map((char, index) => {
    // Interpolate colors - find the right position in the gradient
    const colorPosition = index / Math.max(textLength - 1, 1);
    const colorIndex = Math.min(
      Math.floor(colorPosition * (colors.length - 1)),
      colors.length - 2
    );
    
    // Calculate how far between the two colors (0-1)
    const colorRatio = (colorPosition * (colors.length - 1)) - colorIndex;
    
    // Get the color - for simplicity, we'll just use discrete colors from the array
    // rather than true interpolation
    const color = colors[Math.min(colorIndex + Math.round(colorRatio), colors.length - 1)];
    
    return (
      <Text
        key={index}
        style={{
          color,
          fontSize,
          fontWeight,
        }}
      >
        {char}
      </Text>
    );
  });

  return (
    <View style={styles.container}>
      {segments}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  }
}); 