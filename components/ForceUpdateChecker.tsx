import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, Linking, Platform } from 'react-native';
import { Button, Surface } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import * as Application from 'expo-application';
import { useTheme } from '@react-navigation/native';
import { FORCE_UPDATE_CONFIG, shouldForceUpdate, getStoreUrl } from '@/constants/ForceUpdateConfig';

export const ForceUpdateChecker: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showForceUpdate, setShowForceUpdate] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const { colors } = useTheme();

  useEffect(() => {
    checkForceUpdate();
  }, []);

  const checkForceUpdate = async () => {
    try {
      setIsChecking(true);
      
      // Get current app version
      const currentVersion = Application.nativeApplicationVersion || '1.0.0';
      
      // Check if force update should be triggered
      if (shouldForceUpdate(currentVersion)) {
        setShowForceUpdate(true);
        
        // Log the force update trigger
        console.log('Force update triggered:', {
          currentVersion,
          minimumVersion: FORCE_UPDATE_CONFIG.minimumVersion,
          forceUpdateDate: FORCE_UPDATE_CONFIG.forceUpdateDate,
          currentDate: new Date().toISOString(),
          isEnabled: FORCE_UPDATE_CONFIG.isEnabled
        });
      }
    } catch (error) {
      console.error('Error checking force update:', error);
      // If there's an error checking, allow the app to continue
    } finally {
      setIsChecking(false);
    }
  };

  const handleUpdateNow = () => {
    const storeUrl = getStoreUrl();
    
    if (storeUrl) {
      Linking.openURL(storeUrl).catch((error) => {
        console.error('Error opening store URL:', error);
        Alert.alert(
          'Update Required',
          'Please manually update the app from the Play Store to continue using AI Prescription Saathi.',
          [{ text: 'OK' }]
        );
      });
    } else {
      Alert.alert(
        'Update Required',
        'Please manually update the app from the Play Store to continue using AI Prescription Saathi.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleExitApp = () => {
    Alert.alert(
      'Exit App',
      'You must update the app to continue. Would you like to exit?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Exit', 
          style: 'destructive',
          onPress: () => {
            // Force close the app
            if (Platform.OS === 'android') {
              // For Android, we can't force close, but we can show the update screen
              setShowForceUpdate(true);
            } else {
              // For iOS, we can't force close either
              setShowForceUpdate(true);
            }
          }
        }
      ]
    );
  };

  if (isChecking) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LinearGradient colors={["#4c669f", "#3b5998", "#192f6a"]} style={styles.gradient}>
          <View style={styles.loadingContainer}>
            <MaterialIcons name="system-update" size={60} color="#ffffff" />
            <Text style={styles.loadingText}>Checking for updates...</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  if (showForceUpdate) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LinearGradient colors={["#4c669f", "#3b5998", "#192f6a"]} style={styles.gradient}>
          <Surface style={[styles.updateCard, { backgroundColor: colors.card }]} elevation={4}>
            <View style={styles.updateContent}>
              <MaterialIcons name="system-update-alt" size={80} color="#FF6B6B" />
              
              <Text style={[styles.updateTitle, { color: colors.text }]}>
                Update Required
              </Text>
              
              <Text style={[styles.updateMessage, { color: colors.text }]}>
                {FORCE_UPDATE_CONFIG.message}
              </Text>
              
              <View style={styles.versionInfo}>
                <Text style={[styles.versionText, { color: colors.text }]}>
                  Current Version: {Application.nativeApplicationVersion || 'Unknown'}
                </Text>
                <Text style={[styles.versionText, { color: colors.text }]}>
                  Required Version: {FORCE_UPDATE_CONFIG.minimumVersion}
                </Text>
              </View>
              
              <View style={styles.buttonContainer}>
                <Button
                  mode="contained"
                  onPress={handleUpdateNow}
                  style={[styles.updateButton, { backgroundColor: '#4CAF50' }]}
                  labelStyle={styles.buttonLabel}
                  icon="download"
                >
                  Update Now
                </Button>
                
                <Button
                  mode="outlined"
                  onPress={handleExitApp}
                  style={[styles.exitButton, { borderColor: colors.border }]}
                  labelStyle={[styles.buttonLabel, { color: colors.text }]}
                  icon="exit-to-app"
                >
                  Exit App
                </Button>
              </View>
              
              <Text style={[styles.footerText, { color: colors.text }]}>
                This update is mandatory for security and performance improvements.
              </Text>
            </View>
          </Surface>
        </LinearGradient>
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 18,
    marginTop: 20,
    textAlign: 'center',
  },
  updateCard: {
    borderRadius: 16,
    padding: 24,
    margin: 20,
    maxWidth: 400,
    width: '100%',
  },
  updateContent: {
    alignItems: 'center',
  },
  updateTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 16,
    textAlign: 'center',
  },
  updateMessage: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  versionInfo: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    width: '100%',
  },
  versionText: {
    fontSize: 14,
    marginBottom: 4,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  updateButton: {
    marginBottom: 8,
    paddingVertical: 8,
  },
  exitButton: {
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 20,
    opacity: 0.7,
  },
}); 