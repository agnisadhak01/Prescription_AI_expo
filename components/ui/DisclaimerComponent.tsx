import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';

type DisclaimerType = 'medical' | 'privacy' | 'ai' | 'payment';

interface DisclaimerProps {
  type: DisclaimerType;
  style?: ViewStyle;
  compact?: boolean;
}

/**
 * A reusable disclaimer component for Google Play Store compliance
 * Displays appropriate disclaimers based on the type provided
 */
const DisclaimerComponent: React.FC<DisclaimerProps> = ({ 
  type, 
  style,
  compact = false 
}) => {
  const { colors } = useTheme();
  
  const getDisclaimerColor = (type: DisclaimerType) => {
    switch (type) {
      case 'medical':
        return { bg: 'rgba(255, 107, 107, 0.1)', icon: '#ff6b6b' };
      case 'ai':
        return { bg: 'rgba(76, 102, 159, 0.1)', icon: colors.primary || '#4c669f' };
      case 'privacy':
        return { bg: 'rgba(67, 234, 46, 0.1)', icon: '#43ea2e' };
      case 'payment':
        return { bg: 'rgba(255, 190, 11, 0.1)', icon: '#ffbe0b' };
    }
  };

  const disclaimerContent = {
    medical: {
      icon: 'medical',
      title: 'Medical Disclaimer',
      text: 'This app is not intended for medical use, is not a medical device, and is designed for general organization purposes only. Always consult healthcare professionals for medical advice.'
    },
    privacy: {
      icon: 'shield-checkmark',
      title: 'Privacy Notice',
      text: 'We securely process prescription data with encryption. Your data is only accessible to you through your authenticated account. See our Privacy Policy for more information.'
    },
    ai: {
      icon: 'scan',
      title: 'AI Accuracy Disclaimer',
      text: 'Our AI-powered scanning technology has limitations and may not be 100% accurate in all cases. Please verify all extracted information for accuracy.'
    },
    payment: {
      icon: 'card',
      title: 'Payment Information',
      text: 'Payments are for scan quota credits only. No clinical services or medical advice are provided with purchase. All transactions are processed in compliance with Google Play policies.'
    }
  };

  const content = disclaimerContent[type];
  const colors_scheme = getDisclaimerColor(type);
  
  // Compact version for all disclaimer types
  if (compact) {
    return (
      <View style={[
        styles.compactContainer, 
        { backgroundColor: colors_scheme.bg },
        style
      ]}>
        <Ionicons name={content.icon as any} size={16} color={colors_scheme.icon} style={styles.compactIcon} />
        <Text style={[styles.compactText, { color: colors.text }]}>
          {type === 'medical' ? 'Not for medical use. Always consult healthcare professionals.' : 
           type === 'ai' ? 'AI scanning has limitations. Always verify extracted information.' :
           type === 'privacy' ? 'Your data is encrypted and secure.' :
           'Payment for scan credits only, not medical services.'}
        </Text>
      </View>
    );
  }

  // Full disclaimer version
  return (
    <View style={[
      styles.container, 
      { 
        borderColor: colors_scheme.icon,
        backgroundColor: colors_scheme.bg
      }, 
      style
    ]}>
      <View style={styles.headerRow}>
        <Ionicons name={content.icon as any} size={20} color={colors_scheme.icon} style={styles.icon} />
        <Text style={[styles.title, { color: colors_scheme.icon }]}>{content.title}</Text>
      </View>
      <Text style={[styles.text, { color: colors.text }]}>{content.text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginVertical: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  icon: {
    marginRight: 8,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 4,
    marginVertical: 4,
  },
  compactIcon: {
    marginRight: 6,
  },
  compactText: {
    fontSize: 12,
    fontStyle: 'italic',
    flex: 1,
  }
});

export default DisclaimerComponent; 