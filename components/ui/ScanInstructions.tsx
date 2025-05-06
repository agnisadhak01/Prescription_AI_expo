import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from 'react-native-paper';
import { useTheme } from '@react-navigation/native';
import DisclaimerComponent from './DisclaimerComponent';
import { MaterialIcons } from '@expo/vector-icons';

interface ScanInstructionsProps {
  compact?: boolean;
}

const ScanInstructions: React.FC<ScanInstructionsProps> = ({ compact = false }) => {
  const { colors, dark } = useTheme();
  
  // Ensure high contrast background color based on theme
  const cardBackgroundColor = dark ? '#2c2c2c' : 'white';
  const textColor = dark ? '#FFFFFF' : colors.text;
  const accentColor = '#5D85D1'; // Use a bright blue that works in both light and dark

  if (compact) {
    return (
      <View style={[styles.compactContainer, { backgroundColor: dark ? 'rgba(255, 152, 0, 0.2)' : 'rgba(255, 152, 0, 0.1)' }]}>
        <Text style={[styles.compactText, { color: textColor }]}>
          Auto-save enabled: Scanned prescriptions are automatically saved and consume a scan credit.
        </Text>
      </View>
    );
  }

  return (
    <Card style={[styles.container, { backgroundColor: cardBackgroundColor }]}>
      <Card.Content style={styles.cardContent}>
        <Text style={[styles.title, { color: textColor }]}>Scan Instructions</Text>
        
        <View style={styles.instructionItem}>
          <View style={[styles.instructionNumberContainer, { backgroundColor: accentColor }]}>
            <Text style={styles.instructionNumber}>1</Text>
          </View>
          <Text style={[styles.instructionText, { color: textColor }]}>
            Ensure good lighting and place prescription on a flat surface
          </Text>
        </View>
        
        <View style={styles.instructionItem}>
          <View style={[styles.instructionNumberContainer, { backgroundColor: accentColor }]}>
            <Text style={styles.instructionNumber}>2</Text>
          </View>
          <Text style={[styles.instructionText, { color: textColor }]}>
            Hold your device steady to capture a clear image
          </Text>
        </View>
        
        <View style={styles.instructionItem}>
          <View style={[styles.instructionNumberContainer, { backgroundColor: accentColor }]}>
            <Text style={styles.instructionNumber}>3</Text>
          </View>
          <Text style={[styles.instructionText, { color: textColor }]}>
            Include all prescription details in the frame
          </Text>
        </View>
        
        <View style={[styles.notice, { backgroundColor: dark ? 'rgba(255, 152, 0, 0.2)' : 'rgba(255, 152, 0, 0.1)' }]}>
          <MaterialIcons name="info" size={20} color="#FF9800" style={styles.noticeIcon} />
          <Text style={[styles.noticeText, { color: textColor }]}>
            Note: Scanned prescriptions are automatically saved after processing and will consume one scan credit.
          </Text>
        </View>
        
        <DisclaimerComponent type="ai" compact={true} style={styles.disclaimer} />
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    marginHorizontal: 0,
    borderRadius: 12,
    elevation: 3,
  },
  cardContent: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  instructionItem: {
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 0,
  },
  instructionNumberContainer: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  instructionNumber: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  instructionText: {
    fontSize: 14,
    lineHeight: 18,
    flex: 1,
    fontWeight: '500',
  },
  notice: {
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  noticeIcon: {
    marginRight: 6,
  },
  noticeText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
    fontWeight: '500',
  },
  disclaimer: {
    marginTop: 10,
  },
  compactContainer: {
    marginVertical: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  compactText: {
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
    fontWeight: '500',
  }
});

export default ScanInstructions; 