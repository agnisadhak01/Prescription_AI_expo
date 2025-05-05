import React from 'react';
import { ScrollView, View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Stack } from 'expo-router';
import DisclaimerComponent from '../../components/ui/DisclaimerComponent';

/**
 * Terms of Service Screen
 * Displays the app's terms of service with compliance information for Google Play
 */
const TermsOfServiceScreen = () => {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ 
        title: 'Terms of Service',
        headerTitleAlign: 'center',
      }} />

      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.contentContainer}
      >
        <Text style={[styles.title, { color: colors.text }]}>Terms of Service</Text>
        <Text style={[styles.updated, { color: colors.text }]}>Last updated: July 13, 2024</Text>
        
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
            Prescription AI is a personal organization tool designed to help users digitize and manage their prescription information. The App uses optical character recognition (OCR) and artificial intelligence to extract information from prescription images uploaded by users.
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            The App is designed for personal organizational purposes only and is NOT intended to provide medical advice, diagnose health conditions, or replace professional healthcare services.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>3. User Accounts</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            To use certain features of the App, you must register for an account. You agree to provide accurate, current, and complete information and to update your information to keep it accurate, current, and complete.
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            You are responsible for safeguarding your password and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>4. User Content and Responsibility</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            You retain all rights to the prescription images and information you upload to the App. By uploading content, you grant us a non-exclusive, worldwide, royalty-free license to use, process, and store the content solely for the purpose of providing the App's services to you.
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            You are solely responsible for verifying the accuracy of all information extracted by the App. We do not guarantee 100% accuracy of text extraction or interpretation.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>5. Payments and Subscriptions</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            The App offers purchase options for scan credits. All payments are processed securely through authorized payment processors. Payments are for scan quota credits only, not for medical services or advice.
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            All purchases are processed in compliance with Google Play's billing policy. Refunds are handled according to the platform's refund policy.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>6. Medical Disclaimer</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            THE APP IS NOT A MEDICAL DEVICE AND IS NOT INTENDED TO DIAGNOSE, TREAT, CURE, OR PREVENT ANY DISEASE OR HEALTH CONDITION.
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            The App should not be used as a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified healthcare provider with any questions you may have regarding a medical condition.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>7. Limitation of Liability</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL THE COMPANY BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES ARISING OUT OF OR IN CONNECTION WITH THE APP.
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            We specifically disclaim liability for any harm, loss, or damage resulting from:
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            • Inaccuracies in text extraction or interpretation
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            • Reliance on information extracted by the App
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            • Unauthorized access to your account or data
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>8. Modifications to Terms</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            We reserve the right to modify these Terms at any time. We will provide notice of significant changes by posting the new Terms on the App and updating the "Last Updated" date.
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            Your continued use of the App after any changes constitutes your acceptance of the new Terms.
          </Text>
        </View>

        <DisclaimerComponent type="ai" />

        <Text style={[styles.footer, { color: colors.text }]}>
          By using Prescription AI, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
        </Text>
        
        <Text style={[styles.contactInfo, { color: colors.text }]}>
          If you have questions about these Terms, please contact us at:
          contact@autoomstudio.com
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

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
  subSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 6,
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
  },
  contactInfo: {
    marginTop: 24,
    fontSize: 14,
    textAlign: 'center',
  }
});

export default TermsOfServiceScreen; 