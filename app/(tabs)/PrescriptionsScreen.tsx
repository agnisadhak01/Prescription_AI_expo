import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, Card, Button, Searchbar } from 'react-native-paper';
import { Feather, MaterialIcons } from '@expo/vector-icons';

const prescriptionsData = [
  { name: 'PhoneScanner 06-21-2023 20.22', details: 'Created 05-21-2023 20.11' },
  { name: 'Brief Project PhoneScanner Mobile App', details: 'Accessed 05-22-2023 20.45' },
  { name: 'Brief Project PhoneScanner UI Kits', details: 'Accessed 05-23-2023 16.00' },
];

const tools = [
  { icon: 'camera', label: 'Smart Scan', color: '#4e8cff' },
  { icon: 'file-text', label: 'PDF Tools', color: '#ffb74d' },
  { icon: 'image', label: 'Import Picture', color: '#4dd0e1' },
  { icon: 'file-plus', label: 'Import File', color: '#81c784' },
  { icon: 'scissors', label: 'Compress PDF', color: '#f06292' },
  { icon: 'type', label: 'Image to Text', color: '#9575cd' },
  { icon: 'file', label: 'PDF to Word', color: '#ffd54f' },
  { icon: 'more-horizontal', label: 'More', color: '#bdbdbd' },
];

export default function PrescriptionsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [prescriptions, setPrescriptions] = useState(prescriptionsData);

  const filteredPrescriptions = prescriptions.filter(p =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchRow}>
        <Searchbar
          placeholder="Search"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
        <TouchableOpacity style={styles.searchIconBtn}>
          <Feather name="bell" size={22} color="#4e8cff" />
        </TouchableOpacity>
      </View>

      {/* Tools Grid */}
      <View style={styles.toolsGrid}>
        {tools.map((tool, idx) => (
          <View key={tool.label} style={styles.toolItem}>
            <View style={[styles.toolIcon, { backgroundColor: tool.color }] }>
              <Feather name={tool.icon as any} size={20} color="#fff" />
            </View>
            <Text style={styles.toolLabel}>{tool.label}</Text>
          </View>
        ))}
      </View>

      {/* Recent Docs/Prescriptions */}
      <Text style={styles.sectionTitle}>Recent Docs</Text>
      <FlatList
        data={filteredPrescriptions}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <Card style={styles.prescriptionCard}>
            <Card.Content style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={styles.docIcon}>
                <Feather name="file-text" size={28} color="#4e8cff" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.docTitle}>{item.name}</Text>
                <Text style={styles.docDetails}>{item.details}</Text>
              </View>
              <TouchableOpacity>
                <MaterialIcons name="check-box-outline-blank" size={24} color="#bdbdbd" />
              </TouchableOpacity>
            </Card.Content>
          </Card>
        )}
        style={{ marginBottom: 80 }}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab}>
        <Feather name="camera" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafd', paddingTop: 16 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  searchbar: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: '#f1f4f8',
    elevation: 0,
    marginRight: 8,
    height: 44,
  },
  searchIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  toolItem: {
    width: '22%',
    alignItems: 'center',
    marginBottom: 18,
  },
  toolIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    elevation: 2,
  },
  toolLabel: { color: '#222', fontSize: 11, textAlign: 'center' },
  sectionTitle: {
    marginLeft: 20,
    marginBottom: 8,
    color: '#222',
    fontWeight: 'bold',
    fontSize: 16,
  },
  prescriptionCard: {
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    backgroundColor: '#fff',
  },
  docIcon: {
    width: 44,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#e3eaf2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  docTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#222',
    marginBottom: 2,
  },
  docDetails: {
    fontSize: 11,
    color: '#888',
  },
  fab: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: 24,
    backgroundColor: '#4e8cff',
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
}); 