import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, BackHandler, Platform } from 'react-native';
import { Text, Surface, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Link, useRouter, useFocusEffect } from 'expo-router';
import * as Application from 'expo-application';

const InfoScreen = () => {
  const theme = useTheme();
  const router = useRouter();

  // Reset navigation stack when Info tab is focused to ensure it's always treated as a root tab
  useFocusEffect(
    React.useCallback(() => {
      // No need to reset navigation stack or setParams here
      // Do not override hardware back on Info main page
      return;
    }, [])
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* <Text style={[styles.headerTitle, { color: theme.colors.onBackground }]}>Information</Text> */}
        <Text style={[styles.headerSubtitle, { color: theme.colors.onSurfaceVariant }]}>Legal and app information</Text>

        <View style={styles.menuContainer}>
          <TouchableOpacity activeOpacity={0.7} onPress={() => router.replace('/(tabs)/info/terms-of-service')}>
            <Surface style={[styles.menuItem, { backgroundColor: theme.colors.surface }]} elevation={1}>
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
                <Feather name="file-text" size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.textContainer}>
                <Text style={[styles.menuItemTitle, { color: theme.colors.onBackground }]}>Terms of Service</Text>
                <Text style={[styles.menuItemDescription, { color: theme.colors.onSurfaceVariant }]}>Our terms and conditions for using the app</Text>
              </View>
              <Feather name="chevron-right" size={20} color={theme.colors.onSurfaceVariant} />
            </Surface>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.7} onPress={() => router.replace('/(tabs)/info/privacy-policy')}>
            <Surface style={[styles.menuItem, { backgroundColor: theme.colors.surface }]} elevation={1}>
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
                <Feather name="lock" size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.textContainer}>
                <Text style={[styles.menuItemTitle, { color: theme.colors.onBackground }]}>Privacy Policy</Text>
                <Text style={[styles.menuItemDescription, { color: theme.colors.onSurfaceVariant }]}>How we handle and protect your data</Text>
              </View>
              <Feather name="chevron-right" size={20} color={theme.colors.onSurfaceVariant} />
            </Surface>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.7} onPress={() => router.replace('/(tabs)/info/about')}>
            <Surface style={[styles.menuItem, { backgroundColor: theme.colors.surface }]} elevation={1}>
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
                <Feather name="info" size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.textContainer}>
                <Text style={[styles.menuItemTitle, { color: theme.colors.onBackground }]}>About Us</Text>
                <Text style={[styles.menuItemDescription, { color: theme.colors.onSurfaceVariant }]}>Learn more about Prescription AI</Text>
              </View>
              <Feather name="chevron-right" size={20} color={theme.colors.onSurfaceVariant} />
            </Surface>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.7} onPress={() => router.replace('/(tabs)/info/medical-disclaimer')}>
            <Surface style={[styles.menuItem, { backgroundColor: theme.colors.surface }]} elevation={1}>
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
                <Feather name="alert-circle" size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.textContainer}>
                <Text style={[styles.menuItemTitle, { color: theme.colors.onBackground }]}>Medical Disclaimer</Text>
                <Text style={[styles.menuItemDescription, { color: theme.colors.onSurfaceVariant }]}>Important health information</Text>
              </View>
              <Feather name="chevron-right" size={20} color={theme.colors.onSurfaceVariant} />
            </Surface>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.7} onPress={() => router.replace('/(tabs)/info/contact')}>
            <Surface style={[styles.menuItem, { backgroundColor: theme.colors.surface }]} elevation={1}>
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
                <Feather name="mail" size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.textContainer}>
                <Text style={[styles.menuItemTitle, { color: theme.colors.onBackground }]}>Contact Support</Text>
                <Text style={[styles.menuItemDescription, { color: theme.colors.onSurfaceVariant }]}>Get help with using the app</Text>
              </View>
              <Feather name="chevron-right" size={20} color={theme.colors.onSurfaceVariant} />
            </Surface>
          </TouchableOpacity>
        </View>

        <View style={styles.appInfoContainer}>
          <Text style={[styles.appVersion, { color: theme.colors.onSurfaceVariant }]}>Version {Application.nativeApplicationVersion || '1.0.0'}</Text>
          <Text style={[styles.copyright, { color: theme.colors.onSurfaceVariant }]}>© 2025 Prescription AI. All rights reserved.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  },
  appInfoContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  appVersion: {
    fontSize: 14,
    marginBottom: 4,
  },
  copyright: {
    fontSize: 12,
  },
});

export default InfoScreen; 