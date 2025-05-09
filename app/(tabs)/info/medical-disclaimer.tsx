import React from 'react';
import { ScrollView, View, Text, StyleSheet, BackHandler, Platform } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import DisclaimerComponent from '../../../components/ui/DisclaimerComponent';
import { useFocusEffect, useRouter, usePathname } from 'expo-router';

const MedicalDisclaimerPage = () => {
  const { colors } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  // Handle Android hardware back button press
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (router.canGoBack()) {
          if (pathname !== '/info') {
            router.replace('/info');
          } else {
            router.replace('/');
          }
        } else {
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
      <View style={[styles.warningBanner, { backgroundColor: colors.card }]}>
        <Feather name="alert-triangle" size={32} color="#ff6b6b" />
        <Text style={styles.warningText}>IMPORTANT MEDICAL DISCLAIMER</Text>
      </View>

      <DisclaimerComponent type="medical" />

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Not a Medical Device</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          Prescription AI is <Text style={styles.emphasized}>NOT</Text> a medical device and is <Text style={styles.emphasized}>NOT</Text> intended to diagnose, treat, cure, or prevent any disease or health condition.
        </Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          This application is designed solely as a personal organization tool to help you keep track of your prescriptions. It does not provide medical advice or recommendations of any kind.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Technology Limitations</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          The optical character recognition (OCR) and artificial intelligence technologies used in this app have inherent limitations:
        </Text>
        <View style={styles.bulletPoint}>
          <Feather name="alert-circle" size={16} color="#ff6b6b" style={styles.bulletIcon} />
          <Text style={[styles.bulletText, { color: colors.text }]}>
            They may not extract or interpret prescription information with 100% accuracy
          </Text>
        </View>
        <View style={styles.bulletPoint}>
          <Feather name="alert-circle" size={16} color="#ff6b6b" style={styles.bulletIcon} />
          <Text style={[styles.bulletText, { color: colors.text }]}>
            Information may be missing, incomplete, or incorrectly interpreted
          </Text>
        </View>
        <View style={styles.bulletPoint}>
          <Feather name="alert-circle" size={16} color="#ff6b6b" style={styles.bulletIcon} />
          <Text style={[styles.bulletText, { color: colors.text }]}>
            Always verify all extracted information with your original prescription
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Consult Healthcare Professionals</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          Always consult qualified healthcare professionals regarding:
        </Text>
        <View style={styles.bulletPoint}>
          <Feather name="check" size={16} color="#43ea2e" style={styles.bulletIcon} />
          <Text style={[styles.bulletText, { color: colors.text }]}>
            Questions about your medications or treatment
          </Text>
        </View>
        <View style={styles.bulletPoint}>
          <Feather name="check" size={16} color="#43ea2e" style={styles.bulletIcon} />
          <Text style={[styles.bulletText, { color: colors.text }]}>
            Medication dosage, interactions, or side effects
          </Text>
        </View>
        <View style={styles.bulletPoint}>
          <Feather name="check" size={16} color="#43ea2e" style={styles.bulletIcon} />
          <Text style={[styles.bulletText, { color: colors.text }]}>
            Changes to your medication regimen
          </Text>
        </View>
        <View style={styles.bulletPoint}>
          <Feather name="check" size={16} color="#43ea2e" style={styles.bulletIcon} />
          <Text style={[styles.bulletText, { color: colors.text }]}>
            Any health concerns or medical conditions
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>User Responsibility</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          By using this app, you acknowledge and agree that:
        </Text>
        <View style={styles.bulletPoint}>
          <Feather name="user" size={16} color={colors.primary || "#4c669f"} style={styles.bulletIcon} />
          <Text style={[styles.bulletText, { color: colors.text }]}>
            You are solely responsible for verifying the accuracy of all information extracted by the app
          </Text>
        </View>
        <View style={styles.bulletPoint}>
          <Feather name="user" size={16} color={colors.primary || "#4c669f"} style={styles.bulletIcon} />
          <Text style={[styles.bulletText, { color: colors.text }]}>
            You will never rely on this app as a substitute for professional medical advice
          </Text>
        </View>
        <View style={styles.bulletPoint}>
          <Feather name="user" size={16} color={colors.primary || "#4c669f"} style={styles.bulletIcon} />
          <Text style={[styles.bulletText, { color: colors.text }]}>
            You understand the app is for personal organizational purposes only
          </Text>
        </View>
      </View>

      <DisclaimerComponent type="ai" />

      <Text style={[styles.footer, { color: colors.text, backgroundColor: `${colors.primary}20` }]}>
        If you have any questions or concerns about your medications or health, 
        please contact your doctor, pharmacist, or healthcare provider immediately.
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  warningBanner: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  warningText: {
    color: '#ff6b6b',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
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
    marginBottom: 12,
  },
  emphasized: {
    fontWeight: 'bold',
    color: '#ff6b6b',
  },
  bulletPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bulletIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    marginTop: 24,
    fontStyle: 'italic',
    fontSize: 14,
    textAlign: 'center',
    padding: 16,
    borderRadius: 8,
  },
});

export default MedicalDisclaimerPage; 