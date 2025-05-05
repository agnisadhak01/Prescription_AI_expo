import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Modal, Animated, Platform, StatusBar, Alert } from 'react-native';
import { Text, Avatar, Button, Card, List, TextInput, ActivityIndicator, Surface, IconButton, Divider } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../components/AuthContext';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '../../components/supabaseClient';

export default function ProfileScreen() {
  const { user, isEmailVerified, resendVerificationEmail, logout, scansRemaining, refreshScansRemaining } = useAuth();
  const router = useRouter();
  const [editModal, setEditModal] = useState(false);
  const [name, setName] = useState(user?.user_metadata?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleUpdateProfile = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    const { error } = await supabase.auth.updateUser({
      email,
      data: { name },
    });
    if (error) setError(error.message);
    else setSuccess('Profile updated!');
    setLoading(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Gradient Header with Avatar */}
      <LinearGradient 
        colors={["#4c669f", "#3b5998", "#192f6a"]} 
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
            <Avatar.Icon size={80} icon="account" style={styles.avatar} />
          )}
          <View style={styles.userInfo}>
            <Text style={styles.headerName}>{user?.user_metadata?.name || user?.email}</Text>
            <Text style={styles.headerEmail}>{user?.email}</Text>
            {!isEmailVerified && (
              <View style={styles.verificationContainer}>
                <Text style={styles.verificationText}>Email not verified</Text>
                <Button 
                  mode="outlined" 
                  onPress={resendVerificationEmail} 
                  style={styles.verificationButton}
                  labelStyle={styles.verificationButtonLabel}
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
      <Surface style={styles.premiumCard} elevation={2}>
        <View style={styles.premiumContent}>
          <MaterialIcons name="workspace-premium" size={32} color="#4c669f" />
          <View style={styles.premiumInfo}>
            <Text variant="titleMedium" style={styles.premiumTitle}>Go to Premium</Text>
            <Text variant="bodySmall" style={styles.premiumSubtitle}>Get unlimited all access</Text>
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
      <Surface style={styles.sectionCard} elevation={2}>
        <List.Item
          title="Edit Profile"
          description="Update your personal information"
          left={props => <List.Icon {...props} icon="account-edit" color="#4c669f" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => setEditModal(true)}
          style={styles.listItem}
        />
        <List.Item
          title="Document Remaining"
          description="Your remaining document quota"
          left={props => <List.Icon {...props} icon="file-document" color="#4c669f" />}
          right={props => <Text style={styles.remainingCount}>{scansRemaining !== null ? scansRemaining : '-'}</Text>}
          style={styles.listItem}
        />
      </Surface>

      {/* General Section */}
      <Surface style={styles.sectionCard} elevation={2}>
        {/* Empty section - Storage and Security sections removed as requested */}
        <View style={{ padding: 8 }} />
      </Surface>

      {/* Logout Button */}
      <Button 
        mode="contained" 
        style={styles.logoutButton} 
        onPress={() => { logout(); router.replace('/LoginScreen'); }}
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
          <Surface style={styles.modalContent} elevation={4}>
            <View style={styles.modalHeader}>
              <Text variant="titleLarge" style={styles.modalTitle}>Edit Profile</Text>
              <IconButton
                icon="close"
                size={24}
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
                  <Text style={styles.profilePhotoHint}>
                    Your profile photo is inherited from Google Sign-in
                  </Text>
                </>
              ) : (
                <Avatar.Icon size={80} icon="account" style={styles.modalAvatar} />
              )}
            </View>
            
            <TextInput
              label="Full Name"
              value={name}
              onChangeText={setName}
              style={styles.input}
              mode="outlined"
              left={<TextInput.Icon icon="account" />}
            />
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              mode="outlined"
              left={<TextInput.Icon icon="email" />}
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            {success ? <Text style={styles.successText}>{success}</Text> : null}
            <Button 
              mode="contained" 
              onPress={handleUpdateProfile} 
              disabled={loading} 
              style={styles.saveButton}
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