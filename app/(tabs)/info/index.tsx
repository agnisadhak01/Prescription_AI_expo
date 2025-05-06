import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Surface, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Link } from 'expo-router';

const InfoScreen = () => {
  const theme = useTheme();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.headerTitle}>Information</Text>
        <Text style={styles.headerSubtitle}>Legal and app information</Text>

        <View style={styles.menuContainer}>
          <Link href="/(tabs)/info/terms-of-service" asChild>
            <TouchableOpacity activeOpacity={0.7}>
              <Surface style={styles.menuItem} elevation={1}>
                <View style={styles.iconContainer}>
                  <Feather name="file-text" size={24} color={theme.colors.primary} />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.menuItemTitle}>Terms of Service</Text>
                  <Text style={styles.menuItemDescription}>Our terms and conditions for using the app</Text>
                </View>
                <Feather name="chevron-right" size={20} color="#888" />
              </Surface>
            </TouchableOpacity>
          </Link>

          <Link href="/(tabs)/info/privacy-policy" asChild>
            <TouchableOpacity activeOpacity={0.7}>
              <Surface style={styles.menuItem} elevation={1}>
                <View style={styles.iconContainer}>
                  <Feather name="lock" size={24} color={theme.colors.primary} />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.menuItemTitle}>Privacy Policy</Text>
                  <Text style={styles.menuItemDescription}>How we handle and protect your data</Text>
                </View>
                <Feather name="chevron-right" size={20} color="#888" />
              </Surface>
            </TouchableOpacity>
          </Link>

          <Link href="/(tabs)/info/about" asChild>
            <TouchableOpacity activeOpacity={0.7}>
              <Surface style={styles.menuItem} elevation={1}>
                <View style={styles.iconContainer}>
                  <Feather name="info" size={24} color={theme.colors.primary} />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.menuItemTitle}>About Us</Text>
                  <Text style={styles.menuItemDescription}>Learn more about Prescription AI</Text>
                </View>
                <Feather name="chevron-right" size={20} color="#888" />
              </Surface>
            </TouchableOpacity>
          </Link>

          <Link href="/(tabs)/info/medical-disclaimer" asChild>
            <TouchableOpacity activeOpacity={0.7}>
              <Surface style={styles.menuItem} elevation={1}>
                <View style={styles.iconContainer}>
                  <Feather name="alert-circle" size={24} color={theme.colors.primary} />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.menuItemTitle}>Medical Disclaimer</Text>
                  <Text style={styles.menuItemDescription}>Important health information</Text>
                </View>
                <Feather name="chevron-right" size={20} color="#888" />
              </Surface>
            </TouchableOpacity>
          </Link>

          <Link href="/(tabs)/info/contact" asChild>
            <TouchableOpacity activeOpacity={0.7}>
              <Surface style={styles.menuItem} elevation={1}>
                <View style={styles.iconContainer}>
                  <Feather name="mail" size={24} color={theme.colors.primary} />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.menuItemTitle}>Contact Support</Text>
                  <Text style={styles.menuItemDescription}>Get help with using the app</Text>
                </View>
                <Feather name="chevron-right" size={20} color="#888" />
              </Surface>
            </TouchableOpacity>
          </Link>
        </View>

        <View style={styles.appInfoContainer}>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
          <Text style={styles.copyright}>© 2025 Prescription AI. All rights reserved.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  menuContainer: {
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  menuItemDescription: {
    fontSize: 14,
    color: '#666',
  },
  appInfoContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  appVersion: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  copyright: {
    fontSize: 12,
    color: '#888',
  },
});

export default InfoScreen; 