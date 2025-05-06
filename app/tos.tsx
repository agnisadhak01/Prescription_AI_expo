import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import DisclaimerComponent from '../components/ui/DisclaimerComponent';

/**
 * Standalone Terms of Service Page
 */
export default function TermsOfServiceScreen() {
  const { colors } = useTheme();

  return (
    <>
      <Stack.Screen options={{ title: 'Terms of Service' }} />
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.contentContainer}
      >
        <Text style={[styles.title, { color: colors.text }]}>Terms of Service</Text>
        <Text style={[styles.updated, { color: colors.text }]}>Last updated: July 13, 2025</Text>
        
        <DisclaimerComponent type="medical" />
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>1. Acceptance of Terms</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            By accessing or using the Prescription AI application ("the App"), you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access or use the App.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>2. Description of Service</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            Prescription AI is a personal organization tool designed to help users digitize and manage their prescription information.
          </Text>
        </View>

        <DisclaimerComponent type="ai" />

        <Text style={[styles.footer, { color: colors.text }]}>
          By using Prescription AI, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
        </Text>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  updated: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 20,
    textAlign: 'center',
    opacity: 0.7,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 8,
  },
  footer: {
    marginTop: 24,
    fontStyle: 'italic',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 20,
  }
}); 