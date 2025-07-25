import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import DisclaimerComponent from '../../../components/ui/DisclaimerComponent';

/**
 * Terms of Service Page for Info Tab
 */
const TermsOfServicePage = () => {
  const { colors } = useTheme();

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]} 
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={[styles.updated, { color: colors.text }]}>Last updated: July 13, 2025</Text>
      
      <DisclaimerComponent type="medical" />
      
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>1. Acceptance of Terms</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          By accessing or using the AI Prescription Saathi application (&quot;the App&quot;), you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access or use the App.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>2. Description of Service</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          AI Prescription Saathi is a personal organization tool designed to help users digitize and manage their prescription information. The App uses optical character recognition (OCR) and artificial intelligence to extract information from prescription images uploaded by users.
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
          You retain all rights to the prescription images and information you upload to the App. By uploading content, you grant us a non-exclusive, worldwide, royalty-free license to use, process, and store the content solely for the purpose of providing the App&apos;s services to you.
        </Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          You are solely responsible for verifying the accuracy of all information extracted by the App. We do not guarantee 100% accuracy of text extraction or interpretation.
        </Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          By using the App, you acknowledge and agree that prescription information will be automatically saved after processing. You consent to the automated storage of your prescription data and understand that you should always verify the extracted information for accuracy.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>5. Payments and Subscriptions</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          The App offers purchase options for scan credits. All payments are processed securely through authorized payment processors. Payments are for scan quota credits only, not for medical services or advice.
        </Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          All purchases are processed in compliance with Google Play&apos;s billing policy. Refunds are handled according to the platform&apos;s refund policy.
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
        <Text style={[styles.paragraph, { color: colors.text }]}>
          Our AI-powered scanning technology has limitations and may not be 100% accurate in all cases. By using the App, you agree to review all extracted information for accuracy. The App automatically saves prescriptions after processing, and you consent to this data processing and storage with the understanding that you are responsible for verifying all saved information.
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
          We reserve the right to modify these Terms at any time. We will provide notice of significant changes by posting the new Terms on the App and updating the &quot;Last Updated&quot; date.
        </Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          Your continued use of the App after any changes constitutes your acceptance of the new Terms.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>9. Governing Law</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>These Terms are governed by the laws of India, without regard to conflict of law principles.</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>10. Dispute Resolution</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>Any disputes arising from these Terms will be resolved through binding arbitration or in the courts of India, unless otherwise required by law.</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>11. Severability</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>If any provision of these Terms is found to be invalid, the remaining provisions will remain in effect.</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>12. Contact</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>For legal questions, contact: contact@autoomstudio.com</Text>
      </View>

      <DisclaimerComponent type="ai" />

      <Text style={[styles.footer, { color: colors.text }]}>
        By using AI Prescription Saathi, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
      </Text>
      
      <Text style={[styles.contactInfo, { color: colors.text }]}>
        If you have questions about these Terms, please contact us at:
        contact@autoomstudio.com
      </Text>
    </ScrollView>
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

export default TermsOfServicePage; 