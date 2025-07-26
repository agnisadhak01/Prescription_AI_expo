import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Modal, RefreshControl } from 'react-native';
import { Text, Avatar, Button, List, TextInput, ActivityIndicator, Surface, IconButton } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../components/AuthContext';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '../../components/supabaseClient';
import * as SecureStore from 'expo-secure-store';
import { useTheme } from '@react-navigation/native';
import { gradientColors } from '@/constants/ThemeConfig';

// In-memory fallback for when SecureStore is not available
const memoryStore: Record<string, string> = {};

// Helper for SecureStore with fallback to memory
const safeStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (e) {
      console.warn('SecureStore unavailable, using memory fallback:', e);
      return memoryStore[key] || null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (e) {
      console.warn('SecureStore unavailable, using memory fallback:', e);
      memoryStore[key] = value;
    }
  },
  deleteItem: async (key: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (e) {
      console.warn('SecureStore unavailable, using memory fallback:', e);
      delete memoryStore[key];
    }
  }
};

export default function ProfileScreen() {
  const { user, isEmailVerified, resendVerificationEmail, logout, scansRemaining, refreshScansRemaining, refreshSession } = useAuth();
  const router = useRouter();
  const { colors, dark } = useTheme();
  const [editModal, setEditModal] = useState(false);
  const [name, setName] = useState(user?.user_metadata?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [displayName, setDisplayName] = useState(user?.user_metadata?.name || user?.email || '');
  const [displayEmail, setDisplayEmail] = useState(user?.email || '');
  const [refreshing, setRefreshing] = useState(false);

  // Define theme-based gradient colors
  const headerGradientColors = dark 
    ? gradientColors.dark.header
    : gradientColors.light.header;

  // Update local state when user data changes
  useEffect(() => {
    if (user) {
      setName(user.user_metadata?.name || '');
      setEmail(user.email || '');
      setDisplayName(user.user_metadata?.name || user.email || '');
      setDisplayEmail(user.email || '');
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Update the user profile in Supabase
      const { error: updateError } = await supabase.auth.updateUser({
        email,
        data: { name },
      });
      
      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }
      
      // Set temporary success message
      setSuccess('Profile updated!');
      
      // Flag that we're updating the profile - used to fix navigation state issues
      await safeStorage.setItem('profile_updated', 'true');
      
      // Refresh the session to get updated user data
      await refreshSession();
      
      // Update local display values
      setDisplayName(name || email);
      setDisplayEmail(email);
      
      // Clear navigation state to prevent ScreenStackFragment errors on restart
      await safeStorage.deleteItem('navigation-state');
      
      // Close the modal after a short delay
      setTimeout(() => {
        setEditModal(false);
        setSuccess('');
        // Remove flag after profile update is complete
        safeStorage.deleteItem('profile_updated');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
      console.error('Error updating profile:', err);
      // Cleanup on error
      safeStorage.deleteItem('profile_updated');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    refreshScansRemaining();
    refreshSession().then(() => {
      setRefreshing(false);
    }).catch(() => {
      setRefreshing(false);
    });
  }, []);

  // Check if there was an interrupted profile update on component mount
  useEffect(() => {
    const checkProfileUpdateState = async () => {
      try {
        const profileUpdated = await safeStorage.getItem('profile_updated');
        if (profileUpdated === 'true') {
          // Clear navigation state and the flag
          await safeStorage.deleteItem('navigation-state');
          await safeStorage.deleteItem('profile_updated');
          // Refresh the session
          await refreshSession();
        }
      } catch (error) {
        console.error('Error checking profile update state:', error);
      }
    };
    
    checkProfileUpdateState();
  }, []);

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]} 
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
    >
      {/* Gradient Header with Avatar */}
      <LinearGradient 
        colors={headerGradientColors as any} 
        style={styles.header}
      >
        <View style={styles.headerContent}>
          {user?.user_metadata?.picture ? (
            <Avatar.Image 
              size={80} 
              source={{ uri: user.user_metadata.picture }} 
              style={styles.avatar} 
            />
          ) : (
            <Avatar.Icon size={80} icon="account" style={styles.avatar} color={colors.background} />
          )}
          <View style={styles.userInfo}>
            <Text style={styles.headerName}>{displayName}</Text>
            <Text style={styles.headerEmail}>{displayEmail}</Text>
            {!isEmailVerified && (
              <View style={styles.verificationContainer}>
                <Text style={styles.verificationText}>Email not verified</Text>
                <Button 
                  mode="outlined" 
                  onPress={resendVerificationEmail} 
                  style={styles.verificationButton}
                  labelStyle={[styles.verificationButtonLabel, { color: '#fff' }]}
                  icon="email-alert"
                >
                  Resend Verification
                </Button>
              </View>
            )}
          </View>
        </View>
      </LinearGradient>

      {/* Premium Card */}
      <Surface style={[styles.premiumCard, { backgroundColor: colors.card }]} elevation={2}>
        <View style={styles.premiumContent}>
          <MaterialIcons name="workspace-premium" size={32} color={colors.primary} />
          <View style={styles.premiumInfo}>
            <Text variant="titleMedium" style={[styles.premiumTitle, { color: colors.text }]}>Go to Premium</Text>
            <Text variant="bodySmall" style={[styles.premiumSubtitle, { color: dark ? '#aaa' : '#666' }]}>Get unlimited all access</Text>
          </View>
          <Button 
            mode="contained" 
            style={styles.upgradeButton}
            labelStyle={styles.upgradeButtonLabel}
            icon="arrow-right"
            onPress={() => router.push('/screens/SubscriptionScreen')}
          >
            Upgrade
          </Button>
        </View>
      </Surface>

      {/* Account Section */}
      <Surface style={[styles.sectionCard, { backgroundColor: colors.card }]} elevation={2}>
        <List.Item
          title="Edit Profile"
          description="Update your personal information"
          left={props => <List.Icon {...props} icon="account-edit" color={colors.primary} />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => setEditModal(true)}
          style={styles.listItem}
        />
        <List.Item
          title="Document Remaining"
          description="Your remaining document quota"
          left={props => <List.Icon {...props} icon="file-document" color={colors.primary} />}
          right={props => <Text style={[styles.remainingCount, { color: colors.text }]}>{scansRemaining !== null ? scansRemaining : '-'}</Text>}
          style={styles.listItem}
        />
      </Surface>

      {/* Logout Button */}
      <Button 
        mode="contained" 
        style={styles.logoutButton} 
        onPress={async () => { 
          await logout(); 
          router.replace('/LoginScreen'); 
        }}
        icon="logout"
        contentStyle={styles.logoutButtonContent}
      >
        Logout
      </Button>

      {/* Edit Profile Modal */}
      <Modal
        visible={editModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Surface style={[styles.modalContent, { backgroundColor: colors.card }]} elevation={4}>
            <View style={styles.modalHeader}>
              <Text variant="titleLarge" style={[styles.modalTitle, { color: colors.text }]}>Edit Profile</Text>
              <IconButton
                icon={props => <Feather name="x" size={24} color={colors.text} />}
                onPress={() => setEditModal(false)}
              />
            </View>
            <View style={styles.profilePhotoContainer}>
              {user?.user_metadata?.picture ? (
                <>
                  <Avatar.Image 
                    size={80} 
                    source={{ uri: user.user_metadata.picture }} 
                    style={styles.modalAvatar} 
                  />
                  <Text style={[styles.profilePhotoHint, { color: colors.text }]}>
                    Your profile photo is inherited from Google Sign-in
                  </Text>
                </>
              ) : (
                <Avatar.Icon size={80} icon="account" style={styles.modalAvatar} color={colors.text} />
              )}
            </View>
            <TextInput
              label="Full Name"
              value={name}
              onChangeText={setName}
              style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
              mode="outlined"
              left={<TextInput.Icon icon="account" color={colors.text} />}
              theme={{ colors: { text: colors.text, primary: colors.primary, placeholder: colors.text } }}
              placeholderTextColor={colors.text}
            />
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
              keyboardType="email-address"
              autoCapitalize="none"
              mode="outlined"
              left={<TextInput.Icon icon="email" color={colors.text} />}
              theme={{ colors: { text: colors.text, primary: colors.primary, placeholder: colors.text } }}
              placeholderTextColor={colors.text}
            />
            {error ? <Text style={[styles.errorText, { color: '#ff4444' }]}>{error}</Text> : null}
            {success ? <Text style={[styles.successText, { color: '#4CAF50' }]}>{success}</Text> : null}
            <Button 
              mode="contained" 
              onPress={handleUpdateProfile} 
              disabled={loading} 
              style={[styles.saveButton, { backgroundColor: colors.primary }]} 
              contentStyle={styles.saveButtonContent}
              icon="content-save"
            >
              Save Changes
            </Button>
            {loading && <ActivityIndicator style={styles.loadingIndicator} />}
          </Surface>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafd',
  },
  contentContainer: {
    paddingBottom: 32,
  },
  header: {
    paddingTop: 48,
    paddingBottom: 32,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  avatar: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  userInfo: {
    alignItems: 'center',
  },
  headerName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerEmail: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    marginBottom: 8,
  },
  verificationContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  verificationText: {
    color: '#ffd700',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  verificationButton: {
    borderColor: '#ffd700',
  },
  verificationButtonLabel: {
    color: '#ffd700',
  },
  premiumCard: {
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  premiumContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  premiumInfo: {
    flex: 1,
    marginLeft: 16,
  },
  premiumTitle: {
    fontWeight: 'bold',
    color: '#333',
  },
  premiumSubtitle: {
    color: '#666',
  },
  upgradeButton: {
    backgroundColor: '#4c669f',
    borderRadius: 12,
  },
  upgradeButtonLabel: {
    color: '#fff',
  },
  sectionCard: {
    margin: 16,
    marginTop: 0,
    borderRadius: 16,
    overflow: 'hidden',
  },
  listItem: {
    paddingVertical: 12,
  },
  remainingCount: {
    color: '#4c669f',
    fontWeight: 'bold',
    fontSize: 16,
  },
  logoutButton: {
    margin: 16,
    marginTop: 24,
    borderRadius: 12,
    backgroundColor: '#4c669f',
  },
  logoutButtonContent: {
    height: 48,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontWeight: 'bold',
  },
  input: {
    margin: 16,
    marginTop: 8,
    backgroundColor: '#fff',
  },
  errorText: {
    color: '#ff4444',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  successText: {
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  saveButton: {
    margin: 16,
    marginTop: 8,
    borderRadius: 12,
    backgroundColor: '#4c669f',
  },
  saveButtonContent: {
    height: 48,
  },
  loadingIndicator: {
    marginTop: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 8,
  },
  profilePhotoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modalAvatar: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  profilePhotoHint: {
    color: '#666',
    fontSize: 12,
    marginTop: 8,
  },
}); 