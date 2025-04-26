import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Avatar, Button, Card, List } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../components/AuthContext';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  // Placeholder user data
  const user = { name: 'John Klan', email: 'john34@dpop.site' };
  const { logout } = useAuth();
  const router = useRouter();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f6f8fa' }} contentContainerStyle={{ paddingBottom: 32 }}>
      {/* Gradient Header with Avatar */}
      <LinearGradient colors={["#2193b0", "#6dd5ed"]} style={styles.header}>
        <Avatar.Icon size={72} icon="account" style={styles.avatar} />
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.headerName}>{user.name}</Text>
          <Text style={styles.headerEmail}>{user.email}</Text>
        </View>
        <Button mode="contained" style={styles.upgradeButton} labelStyle={{ color: '#fff' }}>Upgrade</Button>
      </LinearGradient>

      {/* Premium Card */}
      <Card style={styles.premiumCard}>
        <Card.Content style={{ flexDirection: 'row', alignItems: 'center' }}>
          <MaterialIcons name="workspace-premium" size={32} color="#2575fc" />
          <View style={{ marginLeft: 16, flex: 1 }}>
            <Text variant="titleMedium">Go to Premium</Text>
            <Text variant="bodySmall" style={{ color: '#888' }}>Get unlimited all access</Text>
          </View>
          <Button mode="contained" style={styles.getNowButton} labelStyle={{ color: '#fff' }}>Upgrade</Button>
        </Card.Content>
      </Card>

      {/* Account Section */}
      <Card style={styles.sectionCard}>
        <List.Item
          title="Edit Profile"
          left={props => <Feather name="user" size={22} color="#2575fc" style={{ alignSelf: 'center' }} />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => {}}
        />
        <List.Item
          title="Document Remaining"
          left={props => <Feather name="file" size={22} color="#2575fc" style={{ alignSelf: 'center' }} />}
          right={props => <Text style={{ alignSelf: 'center', color: '#888' }}>5</Text>}
        />
      </Card>

      {/* General Section */}
      <Card style={styles.sectionCard}>
        <List.Item
          title="Storage"
          left={props => <Feather name="database" size={22} color="#2575fc" style={{ alignSelf: 'center' }} />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => {}}
        />
        <List.Item
          title="Security"
          left={props => <Feather name="shield" size={22} color="#2575fc" style={{ alignSelf: 'center' }} />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => {}}
        />
      </Card>

      {/* Logout Button */}
      <Button mode="contained" style={styles.logoutButton} onPress={() => { logout(); router.replace('/LoginScreen'); }}>
        Logout
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 48,
    paddingBottom: 24,
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    marginBottom: 16,
  },
  avatar: {
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  headerName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  headerEmail: {
    color: '#e0f7fa',
    fontSize: 14,
    marginBottom: 8,
  },
  upgradeButton: {
    backgroundColor: '#2575fc',
    borderRadius: 16,
    marginTop: 8,
    paddingHorizontal: 16,
  },
  premiumCard: {
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  getNowButton: {
    backgroundColor: '#2575fc',
    borderRadius: 16,
    marginLeft: 8,
    paddingHorizontal: 12,
  },
  sectionCard: {
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  logoutButton: {
    marginHorizontal: 16,
    marginTop: 24,
    borderRadius: 16,
    backgroundColor: '#2575fc',
    paddingVertical: 8,
  },
}); 