import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../hooks/useAuth';

interface QuotaBadgeProps {
  // Optional props to customize the badge
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
}

export const QuotaBadge: React.FC<QuotaBadgeProps> = ({ 
  size = 'medium',
  showIcon = true
}) => {
  // Get scan quota from global context
  // Updates scan quota using global context
  const { scansRemaining, optimisticScans } = useAuth();
  
  // Use optimistic scans if available, otherwise use actual scans
  const displayScans = optimisticScans !== null ? optimisticScans : scansRemaining;
  
  // Determine color based on remaining scans
  const getBadgeColor = () => {
    if (displayScans <= 0) return styles.dangerBadge;
    if (displayScans < 5) return styles.warningBadge;
    return styles.normalBadge;
  };
  
  // Determine text size based on prop
  const getTextStyle = () => {
    switch (size) {
      case 'small': return styles.smallText;
      case 'large': return styles.largeText;
      default: return styles.mediumText;
    }
  };
  
  return (
    <View style={[styles.badge, getBadgeColor()]}>
      {showIcon && (
        <Text style={[styles.icon, getTextStyle()]}>📷</Text>
      )}
      <Text style={[styles.text, getTextStyle()]}>
        {displayScans} scan{displayScans !== 1 ? 's' : ''}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginHorizontal: 5,
  },
  normalBadge: {
    backgroundColor: '#e6f7ff',
    borderColor: '#1890ff',
    borderWidth: 1,
  },
  warningBadge: {
    backgroundColor: '#fffbe6',
    borderColor: '#faad14',
    borderWidth: 1,
  },
  dangerBadge: {
    backgroundColor: '#fff2f0',
    borderColor: '#ff4d4f',
    borderWidth: 1,
  },
  text: {
    fontWeight: '600',
  },
  icon: {
    marginRight: 4,
  },
  smallText: {
    fontSize: 12,
  },
  mediumText: {
    fontSize: 14,
  },
  largeText: {
    fontSize: 16,
  },
});

export default QuotaBadge; 