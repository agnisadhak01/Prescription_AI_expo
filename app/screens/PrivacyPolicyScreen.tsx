import React from 'react';
import { ScrollView, View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Stack } from 'expo-router';
import DisclaimerComponent from '../../components/ui/DisclaimerComponent';

/**
 * Privacy Policy Screen
 * Displays the app's privacy policy with compliance information for Google Play
 */
const PrivacyPolicyScreen = () => {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ 
        title: 'Privacy Policy',
        headerTitleAlign: 'center',
      }} />

      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.contentContainer}
      >
        <Text style={[styles.title, { color: colors.text }]}>Privacy Policy</Text>
        <Text style={[styles.updated, { color: colors.text }]}>Last updated: July 13, 2025</Text>
        
        <DisclaimerComponent type="medical" />
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Introduction</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            This Privacy Policy describes how we collect, use, process, and disclose your information, 
            including personal information, in conjunction with your access to and use of the AI Prescription Saathi app.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>1. Information We Collect</Text>
          
          <Text style={[styles.subSectionTitle, { color: colors.text }]}>1.1 Prescription Data</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            • Prescription Images: When you scan a prescription, we collect the image you capture.
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            • Extracted Text Data: Our AI technology extracts text information from your prescriptions 
            including medication names, dosages, frequencies, doctor information, and dates.
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            • Metadata: We collect metadata about your prescriptions such as when they were scanned 
            and any tags or notes you add.
          </Text>
          
          <Text style={[styles.subSectionTitle, { color: colors.text }]}>1.2 Account Information</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            • Email address
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            • Authentication information
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            • Profile information you choose to provide
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>2. How We Process and Store Your Data</Text>
          
          <Text style={[styles.subSectionTitle, { color: colors.text }]}>2.1 Data Processing</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            • OCR Processing: Prescription images are processed using optical character recognition 
            (OCR) technology to extract text.
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            • AI Analysis: Our AI technology attempts to identify and categorize prescription 
            elements (medications, dosages, etc.).
          </Text>
          
          <Text style={[styles.subSectionTitle, { color: colors.text }]}>2.2 Data Storage</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            • Encryption: All prescription data is encrypted both in transit and at rest 
            using industry-standard encryption protocols.
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            • Storage Location: Data is stored on secure servers hosted by our cloud service provider.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>3. Who Can Access Your Data</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            • User Access: Your prescription data is only accessible to you through your authenticated account.
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            • Staff Access: Our staff does not have routine access to your personal prescription details.
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            • Third Parties: We do not sell or share your prescription data with third parties for marketing purposes.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>4. Security Measures</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            We implement comprehensive security measures to protect your personal information:
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            • Industry-Standard Encryption: All data is encrypted in transit and at rest.
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            • Secure Authentication: We use secure authentication mechanisms to protect your account.
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            • Regular Security Audits: We conduct regular security assessments of our systems.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>5. AI Processing Limitations</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            Our AI-powered scanning technology has limitations and may not be 100% accurate in all cases. 
            Users should always verify all extracted information for accuracy. We do not guarantee the 
            accuracy of information extracted from prescriptions and this app should not be used as a 
            substitute for professional medical advice.
          </Text>
        </View>

        <DisclaimerComponent type="ai" />

        <Text style={[styles.footer, { color: colors.text }]}>
          By using AI Prescription Saathi, you acknowledge that the app is for personal organizational purposes only, 
          and not for medical diagnosis, treatment decisions, or as a substitute for professional medical advice.
        </Text>
        
        <Text style={[styles.contactInfo, { color: colors.text }]}>
          If you have questions about this Privacy Policy or our data practices, please contact us at:
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

export default PrivacyPolicyScreen; 