import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Text, Card, Button, Searchbar, Surface, IconButton } from 'react-native-paper';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';

const prescriptionsData = [
  { name: 'PhoneScanner 06-21-2023 20.22', details: 'Created 05-21-2023 20.11' },
  { name: 'Brief Project PhoneScanner Mobile App', details: 'Accessed 05-22-2023 20.45' },
  { name: 'Brief Project PhoneScanner UI Kits', details: 'Accessed 05-23-2023 16.00' },
];

async function cameraToApi(imageUri: string) {
  const formData = new FormData();
  formData.append('file', {
    uri: imageUri,
    name: 'photo.jpg',
    type: 'image/jpeg',
  } as any);
  // Basic Auth credentials
  const username = 'user';
  const password = 'user@123';
  const basicAuth = 'Basic ' + btoa(`${username}:${password}`);
  const response = await fetch('https://home.ausomemgr.com/webhook/prescription-ocr', {
    method: 'POST',
    body: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
      'Authorization': basicAuth,
    },
  });
  if (!response.ok) throw new Error('Failed to upload image');
  return response.json();
}

export default function PrescriptionsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [prescriptions, setPrescriptions] = useState(prescriptionsData);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const filteredPrescriptions = prescriptions.filter(p =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCameraScan = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Camera permission is required.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setLoading(true);
        try {
          const apiResult = await cameraToApi(result.assets[0].uri);
          router.replace({
            pathname: '/screens/ProcessingResultScreen',
            params: { result: JSON.stringify(apiResult) }
          });
        } catch (err) {
          const errorMsg = (err as any)?.message || 'Failed to process image';
          Alert.alert('Error', errorMsg);
        }
        setLoading(false);
      }
    } catch (err) {
      const errorMsg = (err as any)?.message || 'Camera error';
      Alert.alert('Error', errorMsg);
    }
  };

  const handleImageUpload = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Media library permission is required.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setLoading(true);
        try {
          const apiResult = await cameraToApi(result.assets[0].uri);
          router.replace({
            pathname: '/screens/ProcessingResultScreen',
            params: { result: JSON.stringify(apiResult) }
          });
        } catch (err) {
          const errorMsg = (err as any)?.message || 'Failed to process image';
          Alert.alert('Error', errorMsg);
        }
        setLoading(false);
      }
    } catch (err) {
      const errorMsg = (err as any)?.message || 'Image picker error';
      Alert.alert('Error', errorMsg);
    }
  };

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
          <TouchableOpacity style={styles.fab} onPress={() => router.push('/screens/CameraScreen')}>
            <LinearGradient
              colors={["#4c669f", "#3b5998"]}
              style={styles.fabGradient}
            >
              <Feather name="camera" size={24} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={styles.fab} onPress={handleImageUpload}>
            <LinearGradient
              colors={["#4c669f", "#3b5998"]}
              style={styles.fabGradient}
            >
              <Feather name="image" size={24} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
        {loading && (
          <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.6)' }}>
            <ActivityIndicator size="large" color="#4c669f" />
            <Text style={{ marginTop: 12, color: '#4c669f' }}>Processing...</Text>
          </View>
        )}
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