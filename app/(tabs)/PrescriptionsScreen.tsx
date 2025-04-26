import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Animated } from 'react-native';
import { Text, Card, Button, Searchbar, Surface, IconButton } from 'react-native-paper';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const prescriptionsData = [
  { name: 'PhoneScanner 06-21-2023 20.22', details: 'Created 05-21-2023 20.11' },
  { name: 'Brief Project PhoneScanner Mobile App', details: 'Accessed 05-22-2023 20.45' },
  { name: 'Brief Project PhoneScanner UI Kits', details: 'Accessed 05-23-2023 16.00' },
];

export default function PrescriptionsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [prescriptions, setPrescriptions] = useState(prescriptionsData);

  const filteredPrescriptions = prescriptions.filter(p =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#4c669f", "#3b5998", "#192f6a"]} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>My Prescriptions</Text>
          <IconButton
            icon="bell"
            iconColor="#fff"
            size={24}
            onPress={() => {}}
            style={styles.notificationButton}
          />
        </View>
        <Searchbar
          placeholder="Search prescriptions..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          iconColor="#4c669f"
          inputStyle={styles.searchInput}
        />
      </LinearGradient>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Recent Documents</Text>
        <FlatList
          data={filteredPrescriptions}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <Surface style={styles.prescriptionCard} elevation={2}>
              <View style={styles.cardContent}>
                <View style={styles.docIcon}>
                  <Feather name="file-text" size={24} color="#4c669f" />
                </View>
                <View style={styles.docInfo}>
                  <Text style={styles.docTitle}>{item.name}</Text>
                  <Text style={styles.docDetails}>{item.details}</Text>
                </View>
                <TouchableOpacity style={styles.checkbox}>
                  <MaterialIcons name="check-box-outline-blank" size={24} color="#bdbdbd" />
                </TouchableOpacity>
              </View>
            </Surface>
          )}
          style={styles.list}
          showsVerticalScrollIndicator={false}
        />

        <View style={styles.fabContainer}>
          <TouchableOpacity style={styles.fab}>
            <LinearGradient
              colors={["#4c669f", "#3b5998"]}
              style={styles.fabGradient}
            >
              <Feather name="camera" size={24} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={styles.fab}>
            <LinearGradient
              colors={["#4c669f", "#3b5998"]}
              style={styles.fabGradient}
            >
              <Feather name="image" size={24} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafd',
  },
  header: {
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  notificationButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  searchbar: {
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    elevation: 0,
    height: 48,
  },
  searchInput: {
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    marginLeft: 8,
  },
  list: {
    flex: 1,
  },
  prescriptionCard: {
    borderRadius: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  docIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#e3eaf2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  docInfo: {
    flex: 1,
    marginLeft: 12,
  },
  docTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  docDetails: {
    fontSize: 12,
    color: '#666',
  },
  checkbox: {
    padding: 8,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    flexDirection: 'row',
    gap: 16,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    elevation: 4,
  },
  fabGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 