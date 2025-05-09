import React from 'react';
import { ScrollView, View, Text, StyleSheet, BackHandler, Platform } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useFocusEffect, useRouter, usePathname } from 'expo-router';
import DisclaimerComponent from '../../../components/ui/DisclaimerComponent';

/**
 * Privacy Policy Page for Info Tab
 */
const PrivacyPolicyPage = () => {
  const { colors } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  // Handle Android hardware back button press
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (router.canGoBack()) {
          // If not on info index, go to info index
          if (pathname !== '/info') {
            router.replace('/info');
          } else {
            // If on info index, go to home
            router.replace('/');
          }
        } else {
          // If can't go back, go to home
          router.replace('/');
        }
        return true;
      };
      if (Platform.OS === 'android') {
        BackHandler.addEventListener('hardwareBackPress', onBackPress);
        return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
      }
      return;
    }, [router, pathname])
  );

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]} 
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={[styles.title, { color: colors.text }]}>Privacy Policy</Text>
      <Text style={[styles.updated, { color: colors.text }]}>Last updated: July 13, 2025</Text>
      
      <DisclaimerComponent type="medical" />
      
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Introduction</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          This Privacy Policy describes how we collect, use, process, and disclose your information, 
          including personal information, in conjunction with your access to and use of the Prescription AI app.
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
        <Text style={[styles.paragraph, { color: colors.text }]}>Our app processes and stores your data as follows:</Text>
        
        <Text style={[styles.subSectionTitle, { color: colors.text }]}>2.1 Data Processing</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          • Prescription images are processed using optical character recognition (OCR) technology to extract text.
        </Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          • Our AI technology attempts to identify and categorize prescription elements (medications, dosages, etc.).
        </Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          • Usage patterns are analyzed in an anonymized form to improve our services.
        </Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          • When you scan a prescription, the extracted information is automatically saved to your account. This automated processing is necessary for providing our service and is done with your consent, which you provide by using the scanning feature.
        </Text>
        
        <Text style={[styles.subSectionTitle, { color: colors.text }]}>2.2 Data Storage</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          • All prescription data is encrypted both in transit and at rest using industry-standard encryption protocols.
        </Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          • Data is stored on secure servers hosted by our cloud service provider (Supabase).
        </Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          • Your prescription data is retained as long as you maintain an active account. You can delete your data at any time through the app.
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
          Our AI-powered scanning technology has limitations and may not be 100% accurate in all cases. Users should always verify all extracted information for accuracy. We do not guarantee the accuracy of information extracted from prescriptions, and this app should not be used as a substitute for professional medical advice.
        </Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          By using our scanning feature, you consent to the automatic processing and saving of prescription data. You acknowledge that you are responsible for reviewing all extracted data for accuracy and that the app automatically saves this information to your account after processing.
        </Text>
      </View>

      <DisclaimerComponent type="ai" />

      <Text style={[styles.footer, { color: colors.text }]}>
        By using Prescription AI, you acknowledge that the app is for personal organizational purposes only, 
        and not for medical diagnosis, treatment decisions, or as a substitute for professional medical advice.
      </Text>
      
      <Text style={[styles.contactInfo, { color: colors.text }]}>
        If you have questions about this Privacy Policy or our data practices, please contact us at:
        contact@autoomstudio.com
      </Text>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>6. International Data Transfers</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>Your information may be transferred to—and maintained on—servers located outside your country. We take steps to ensure your data is treated securely and in accordance with this Privacy Policy.</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>7. Data Retention</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>We retain your data only as long as necessary to provide our services and comply with legal obligations. You may request deletion of your data at any time.</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>8. GDPR Rights (EU Users)</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>If you are located in the European Economic Area (EEA), you have the right to access, correct, update, or request deletion of your personal information. You may also object to processing, request restriction, or request data portability. To exercise these rights, contact us at contact@autoomstudio.com.</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>Our legal basis for processing your data includes your consent, performance of a contract, and compliance with legal obligations.</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>9. CCPA Rights (California Residents)</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>If you are a California resident, you have the right to request disclosure of the categories and specific pieces of personal information we have collected, request deletion of your personal information, and opt out of the sale of your personal information (we do not sell your data). To exercise these rights, contact us at contact@autoomstudio.com.</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>10. Children's Privacy</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>Our app is not intended for children under 13. We do not knowingly collect personal information from children under 13. If you believe a child has provided us with personal information, contact us and we will delete it.</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>11. Contact Us</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>For privacy questions or to exercise your rights, contact: contact@autoomstudio.com</Text>
      </View>
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

export default PrivacyPolicyPage; 