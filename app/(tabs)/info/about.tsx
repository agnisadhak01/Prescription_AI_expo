import React from 'react';
import { ScrollView, View, Text, StyleSheet, Image } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

const AboutPage = () => {
  const { colors } = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={['#4c669f', '#3b5998', '#192f6a']}
        style={styles.header}
      >
        <View style={styles.logoContainer}>
          <Image
            source={require('../../../assets/images/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.appName}>Prescription AI</Text>
        <Text style={styles.tagline}>Your personal prescription management assistant</Text>
        <Text style={styles.version}>Version 1.0.0</Text>
      </LinearGradient>

      <View style={styles.contentContainer}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>About Us</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            Prescription AI is dedicated to helping users better organize and manage their prescription
            information. Our app uses AI technology to extract and organize details from your prescription
            images, making it easier to keep track of your medications and treatments.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Our Mission</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            We aim to simplify personal health management by providing tools that make prescription 
            information more accessible and organized. Our goal is to help you stay on top of your
            medication schedules, refill dates, and prescription history.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Features</Text>
          
          <View style={styles.featureItem}>
            <Feather name="camera" size={24} color={colors.primary || "#4c669f"} style={styles.featureIcon} />
            <View style={styles.featureTextContainer}>
              <Text style={[styles.featureTitle, { color: colors.text }]}>Prescription Scanning</Text>
              <Text style={[styles.featureDescription, { color: colors.text }]}>
                Capture prescriptions with your camera for quick digitization
              </Text>
            </View>
          </View>
          
          <View style={styles.featureItem}>
            <Feather name="file-text" size={24} color={colors.primary || "#4c669f"} style={styles.featureIcon} />
            <View style={styles.featureTextContainer}>
              <Text style={[styles.featureTitle, { color: colors.text }]}>Text Extraction</Text>
              <Text style={[styles.featureDescription, { color: colors.text }]}>
                AI-powered text recognition to extract prescription details
              </Text>
            </View>
          </View>
          
          <View style={styles.featureItem}>
            <Feather name="list" size={24} color={colors.primary || "#4c669f"} style={styles.featureIcon} />
            <View style={styles.featureTextContainer}>
              <Text style={[styles.featureTitle, { color: colors.text }]}>Medication Management</Text>
              <Text style={[styles.featureDescription, { color: colors.text }]}>
                Store and organize all your prescription information
              </Text>
            </View>
          </View>
          
          <View style={styles.featureItem}>
            <Feather name="cloud" size={24} color={colors.primary || "#4c669f"} style={styles.featureIcon} />
            <View style={styles.featureTextContainer}>
              <Text style={[styles.featureTitle, { color: colors.text }]}>Secure Cloud Storage</Text>
              <Text style={[styles.featureDescription, { color: colors.text }]}>
                Keep your prescription data safe and accessible
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Contact Us</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            We'd love to hear from you! For support, feedback, or questions, please contact us at:
          </Text>
          <Text style={[styles.contactEmail, { color: colors.text }]}>
            contact@autoomstudio.com
          </Text>
        </View>

        <Text style={[styles.copyright, { color: colors.text, opacity: 0.6 }]}>© 2024 Prescription AI. All rights reserved.</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 32,
    alignItems: 'center',
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  logo: {
    width: 80,
    height: 80,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: 8,
  },
  version: {
    fontSize: 14,
    color: 'white',
    opacity: 0.7,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  featureIcon: {
    marginRight: 16,
    marginTop: 2,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  contactEmail: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
  copyright: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 24,
  },
});

export default AboutPage; 