import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Image, Platform, StatusBar } from 'react-native';
import { Text, Card, Searchbar, Surface, IconButton } from 'react-native-paper';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '@/components/AuthContext';
import { getPrescriptions, deletePrescription } from '@/components/prescriptionService';
import { useCameraPermissions } from 'expo-camera';
import * as FileSystem from 'expo-file-system';
import { getPrescriptionImages, deletePrescriptionImage, getSignedPrescriptionImageUrl } from '@/components/storageService';
import ImageViewing from 'react-native-image-viewing';
import { supabase } from '@/components/supabaseClient';

interface Prescription {
  id: string;
  doctor_name: string;
  patient_name: string;
  date: string;
  created_at: string;
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }>;
}

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
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(false);
  const [thumbnails, setThumbnails] = useState<{ [id: string]: string | undefined }>({});
  const [thumbnailsLoading, setThumbnailsLoading] = useState(false);
  const router = useRouter();
  const { user, scansRemaining, refreshScansRemaining } = useAuth();
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [optimisticScans, setOptimisticScans] = useState<number | null>(null);
  const [refreshingQuota, setRefreshingQuota] = useState(false);

  const filteredPrescriptions = useMemo(() =>
    prescriptions.filter(p =>
      p.patient_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.doctor_name?.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [prescriptions, searchQuery]
  );

  useEffect(() => {
    if (user) {
      fetchPrescriptions();
    }
  }, [user]);

  useEffect(() => {
    // Fetch thumbnails for the filtered prescriptions
    const fetchThumbnails = async () => {
      setThumbnailsLoading(true);
      const newThumbnails: { [id: string]: string | undefined } = {};
      for (const p of filteredPrescriptions) {
        let filePath: string | undefined = undefined;
        if (Array.isArray((p as any).prescription_images) && (p as any).prescription_images.length > 0) {
          filePath = (p as any).prescription_images[0].image_url;
        } else if ((p as any).image_url) {
          filePath = (p as any).image_url;
        }
        if (filePath) {
          const signedUrl = await getSignedPrescriptionImageUrl(filePath, 600); // 10 min expiry for list
          newThumbnails[p.id] = signedUrl || undefined;
        } else {
          newThumbnails[p.id] = undefined;
        }
      }
      setThumbnails(newThumbnails);
      setThumbnailsLoading(false);
    };
    if (filteredPrescriptions.length > 0) {
      fetchThumbnails();
    } else {
      setThumbnails({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredPrescriptions]);

  useFocusEffect(
    React.useCallback(() => {
      if (user) {
        refreshScansRemaining();
      }
    }, [user])
  );

  useEffect(() => {
    setOptimisticScans(scansRemaining);
  }, [scansRemaining]);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const result = await getPrescriptions(user?.id || '');
      if (result.success) {
        setPrescriptions(result.data || []);
      } else {
        console.error('Failed to fetch prescriptions:', result.error);
      }
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCameraScan = async () => {
    // Check scan quota first
    try {
      if (!cameraPermission?.granted) {
        const permissionResult = await requestCameraPermission();
        if (!permissionResult.granted) {
          Alert.alert('Permission denied', 'Camera permission is required.');
          return;
        }
      }
      
      // Updates scan quota using global context
      await refreshScansRemaining();
      
      // After refreshing, check if user has scans
      if (scansRemaining !== null && scansRemaining <= 0) {
        Alert.alert(
          'Scan Limit Reached',
          'You have used all your available scans. Would you like to purchase more?',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'View Subscription', 
              onPress: () => router.push('/screens/SubscriptionScreen')
            }
          ]
        );
        return;
      }
      
      // Continue with existing camera logic
      setLoading(true);
      try {
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          quality: 0.8,
        });
        if (!result.canceled && result.assets && result.assets.length > 0) {
          const pickedUri = result.assets[0].uri;
          const fileName = pickedUri.split('/').pop() || `image_${Date.now()}.jpg`;
          const docDir = FileSystem.documentDirectory || FileSystem.cacheDirectory || '/';
          const newPath = docDir + fileName;
          await FileSystem.copyAsync({ from: pickedUri, to: newPath });
          const apiResult = await cameraToApi(newPath);
          
          // Set optimistic scan update
          setOptimisticScans(scansRemaining !== null ? Math.max(scansRemaining - 1, 0) : null);
          
          router.replace({
            pathname: '/screens/ProcessingResultScreen',
            params: { 
              result: JSON.stringify(apiResult),
              imageUri: newPath 
            }
          });
        }
      } catch (err) {
        const errorMsg = (err as any)?.message || 'Failed to process image';
        Alert.alert('Error', errorMsg);
      }
      setLoading(false);
    } catch (err) {
      const errorMsg = (err as any)?.message || 'Camera error';
      Alert.alert('Error', errorMsg);
    }
  };

  const handleImageUpload = async () => {
    // Check scan quota first
    try {
      // Updates scan quota using global context
      await refreshScansRemaining();
      
      // After refreshing, check if user has scans
      if (scansRemaining !== null && scansRemaining <= 0) {
        Alert.alert(
          'Scan Limit Reached',
          'You have used all your available scans. Would you like to purchase more?',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'View Subscription', 
              onPress: () => router.push('/screens/SubscriptionScreen')
            }
          ]
        );
        return;
      }
      
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Media library permission is required.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setLoading(true);
        try {
          const pickedUri = result.assets[0].uri;
          const fileName = pickedUri.split('/').pop() || `image_${Date.now()}.jpg`;
          const docDir = FileSystem.documentDirectory || FileSystem.cacheDirectory || '/';
          const newPath = docDir + fileName;
          await FileSystem.copyAsync({ from: pickedUri, to: newPath });
          const apiResult = await cameraToApi(newPath);
          
          // Set optimistic scan update
          setOptimisticScans(scansRemaining !== null ? Math.max(scansRemaining - 1, 0) : null);
          
          router.replace({
            pathname: '/screens/ProcessingResultScreen',
            params: { 
              result: JSON.stringify(apiResult),
              imageUri: newPath 
            }
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

  const handleRefreshQuota = async () => {
    try {
      setRefreshingQuota(true);
      await refreshScansRemaining();
    } catch (error) {
      console.error('Error refreshing scan quota:', error);
      Alert.alert('Error', 'Failed to refresh scan quota. Please try again.');
    } finally {
      setRefreshingQuota(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    try {
      // Delete all images from storage first
      const imageUrls = await getPrescriptionImages(selectedId);
      for (const url of imageUrls) {
        await deletePrescriptionImage(url);
      }
      // Now delete the prescription from the database
      const result = await deletePrescription(selectedId);
      if (result.success) {
        setPrescriptions((prev) => prev.filter((p) => p.id !== selectedId));
        setSelectedId(null);
        Alert.alert('Deleted', 'Prescription deleted successfully.');
      } else {
        Alert.alert('Error', 'Failed to delete prescription.');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to delete prescription.');
    }
  };

  if (user === undefined) {
    return null;
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#4c669f" barStyle="light-content" />
      <LinearGradient 
        colors={["#4c669f", "#3b5998", "#192f6a"]} 
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>My Prescriptions</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.subscriptionButton}
              onPress={() => router.push('/screens/SubscriptionScreen')}
            >
              <View style={styles.subscriptionBadge}>
                <Text style={styles.subscriptionBadgeText}>{optimisticScans !== null ? optimisticScans : (scansRemaining || '?')}</Text>
              </View>
              <Feather name="file-text" size={20} color="#fff" />
            </TouchableOpacity>
            
            <IconButton
              icon="refresh"
              iconColor="#fff"
              size={24}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                marginRight: 8,
                width: 44,
                height: 44,
                borderRadius: 22,
                elevation: 2,
              }}
              onPress={handleRefreshQuota}
              disabled={refreshingQuota}
              loading={refreshingQuota}
            />
            
            <IconButton
              icon="bell"
              iconColor="#fff"
              size={24}
              onPress={() => {}}
              style={styles.notificationButton}
            />
          </View>
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

      <LinearGradient
        colors={["#e0f7fa", "#f5f5f5", "#e3f2fd"]}
        style={styles.content}
      >
        <Text style={styles.sectionTitle}>Recent Documents</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#4c669f" style={styles.loader} />
        ) : (
          <FlatList
            data={filteredPrescriptions}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <LinearGradient
                colors={["#ffffff", "#f8f9fa", "#f0f4f8"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.prescriptionCard}
              >
                <View style={styles.cardContent}>
                  <TouchableOpacity
                    onPress={() => {
                      if (thumbnails[item.id]) {
                        setSelectedImageUrl(thumbnails[item.id]!);
                        setImageViewerVisible(true);
                      }
                    }}
                    activeOpacity={0.8}
                  >
                    <View style={styles.docIcon}>
                      {/* Thumbnail image if available */}
                      {thumbnailsLoading ? (
                        <ActivityIndicator size="small" color="#4c669f" />
                      ) : thumbnails[item.id] ? (
                        <LinearGradient
                          colors={["#43ea2e", "#ffe600"]}
                          start={{ x: 0.5, y: 0 }}
                          end={{ x: 0.5, y: 1 }}
                          style={{
                            borderRadius: 12,
                            padding: 2.5,
                            alignItems: 'center',
                            justifyContent: 'center',
                            elevation: 3,
                          }}
                        >
                          <View style={{
                            backgroundColor: '#fff',
                            borderRadius: 10,
                            width: 80,
                            height: 80,
                            overflow: 'hidden',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                            <Image
                              source={{ uri: thumbnails[item.id] }}
                              style={{ width: '100%', height: '100%', borderRadius: 10 }}
                              resizeMode="cover"
                            />
                          </View>
                        </LinearGradient>
                      ) : (
                        <LinearGradient
                          colors={["#e1f5fe", "#b3e5fc"]}
                          style={{
                            width: 80,
                            height: 80,
                            borderRadius: 12,
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}
                        >
                          <Feather name="file-text" size={30} color="#4c669f" />
                        </LinearGradient>
                      )}
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.docInfo}
                    onPress={() => {
                      setSelectedId(null);
                      router.push({
                        pathname: '/screens/ProcessingResultScreen',
                        params: { result: JSON.stringify(item) }
                      });
                    }}
                  >
                    <Text style={styles.docTitle}>{item.patient_name}</Text>
                    <Text style={styles.docDetails}>Doctor: {item.doctor_name}</Text>
                    <Text style={styles.docDetails}>Date: {formatDate(item.created_at)}</Text>
                    <Text style={styles.docDetails}>
                      Medications: {item.medications.length}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.checkbox}
                    onPress={() => setSelectedId(selectedId === item.id ? null : item.id)}
                  >
                    <MaterialIcons
                      name={selectedId === item.id ? 'check-box' : 'check-box-outline-blank'}
                      size={24}
                      color={selectedId === item.id ? '#4c669f' : '#bdbdbd'}
                    />
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            )}
            style={styles.list}
            showsVerticalScrollIndicator={false}
          />
        )}
        {selectedId && (
          <TouchableOpacity
            style={{
              position: 'absolute',
              bottom: 100,
              right: 24,
              backgroundColor: '#ff4444',
              borderRadius: 28,
              padding: 16,
              elevation: 4,
              zIndex: 10,
            }}
            onPress={handleDelete}
          >
            <MaterialIcons name="delete" size={28} color="#fff" />
          </TouchableOpacity>
        )}
      </LinearGradient>

      <View style={styles.fabContainer}>
        <TouchableOpacity style={styles.fab} onPress={handleCameraScan}>
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

      {/* Full-screen image viewer */}
      <ImageViewing
        images={selectedImageUrl ? [{ uri: selectedImageUrl }] : []}
        imageIndex={0}
        visible={imageViewerVisible}
        onRequestClose={() => setImageViewerVisible(false)}
        swipeToCloseEnabled={true}
        doubleTapToZoomEnabled={true}
        presentationStyle="overFullScreen"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafd',
  },
  header: {
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 20 : 40,
    paddingBottom: 24,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 4,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 10,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  subscriptionButton: {
    marginRight: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 8,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 40,
    minHeight: 40,
  },
  refreshButton: {
    marginRight: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 40,
    minHeight: 40,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  subscriptionBadge: {
    backgroundColor: '#43ea2e',
    borderRadius: 12,
    marginRight: 6,
    height: 20,
    minWidth: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subscriptionBadgeText: {
    color: '#333',
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  notificationButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  searchbar: {
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    elevation: 2,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    marginLeft: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  list: {
    flex: 1,
  },
  prescriptionCard: {
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  docIcon: {
    width: 85,
    height: 85,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  docInfo: {
    flex: 1,
    marginLeft: 16,
  },
  docTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  docDetails: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
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
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 