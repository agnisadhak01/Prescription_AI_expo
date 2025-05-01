import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import DisclaimerComponent from './DisclaimerComponent';

interface VerificationPromptProps {
  onVerify: () => void;
}

/**
 * A component to prompt users to verify scanned prescription information
 * Required for Google Play Store compliance with AI/ML guidelines
 */
const VerificationPrompt: React.FC<VerificationPromptProps> = ({ onVerify }) => {
  const [verified, setVerified] = useState(false);
  const { colors } = useTheme();

  const handleVerify = () => {
    setVerified(true);
    onVerify();
  };

  return (
    <View style={[styles.container, { borderColor: colors.border, backgroundColor: colors.card }]}>
      <View style={styles.warningHeader}>
        <Ionicons name="alert-circle" size={24} color="#FF9800" />
        <Text style={[styles.title, { color: colors.text }]}>Verification Required</Text>
      </View>
      
      <DisclaimerComponent type="ai" />
      
      <Text style={[styles.instructions, { color: colors.text }]}>
        Please carefully review the information extracted from your prescription. 
        Our AI technology attempts to identify medication details, but may not be 100% accurate.
      </Text>
      
      {verified ? (
        <View style={[styles.verifiedContainer, { borderColor: 'green' }]}>
          <Ionicons name="checkmark-circle" size={20} color="green" />
          <Text style={[styles.verifiedText, { color: 'green' }]}>
            Information verified. Remember to consult healthcare professionals for medical advice.
          </Text>
        </View>
      ) : (
        <TouchableOpacity 
          style={[styles.verifyButton, { backgroundColor: colors.primary }]}
          onPress={handleVerify}
        >
          <Ionicons name="checkmark-circle-outline" size={20} color="white" />
          <Text style={styles.verifyButtonText}>
            I have verified this information is correct
          </Text>
        </TouchableOpacity>
      )}
      
      <Text style={[styles.disclaimer, { color: colors.text }]}>
        This app is not intended for medical use. Always consult your doctor or pharmacist
        for medical advice and before taking any medication.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginVertical: 16,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  instructions: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12,
    marginBottom: 16,
  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 6,
    marginVertical: 8,
  },
  verifyButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  verifiedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    marginVertical: 8,
  },
  verifiedText: {
    marginLeft: 8,
    fontWeight: '500',
  },
  disclaimer: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 12,
    opacity: 0.8,
  }
});

export default VerificationPrompt; 