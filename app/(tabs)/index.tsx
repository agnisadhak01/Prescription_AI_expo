import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Image, Platform, StatusBar, RefreshControl, Modal } from 'react-native';
import { Text, Searchbar } from 'react-native-paper';
import { Feather, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '@/components/AuthContext';
import { getPrescriptions, deletePrescription } from '@/components/prescriptionService';
import { useCameraPermissions } from 'expo-camera';
import * as FileSystem from 'expo-file-system';
import { getPrescriptionImages, deletePrescriptionImage, getSignedPrescriptionImageUrl } from '@/components/storageService';
import ImageViewing from 'react-native-image-viewing';

import NotificationPopup from '@/components/ui/NotificationPopup';
import { cameraToApi } from '@/components/utils/scanUtils';
import { showErrorAlert } from '@/components/utils/errorHandler';
import ScanInstructions from '@/components/ui/ScanInstructions';
import { useTheme } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Prescription {
  id: string;
  doctor_name: string;
  patient_name: string;
  date: string;
  created_at: string;
  medications: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }[];
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
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [optimisticScans, setOptimisticScans] = useState<number | null>(null);
  const [refreshingQuota, setRefreshingQuota] = useState(false);
  const [notificationPopupVisible, setNotificationPopupVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [helpModalVisible, setHelpModalVisible] = useState(false);
  const { colors, dark } = useTheme();

  // Define gradient colors based on theme with as const for proper typing
  const headerGradientColors = dark 
    ? ["#2A3A64", "#1D2951", "#121836"] as const
    : ["#4c669f", "#3b5998", "#192f6a"] as const;
  
  const actionGradientColors = dark 
    ? ["#3A4C7A", "#2A3A64", "#1D2951"] as const
    : ["#4c669f", "#3b5998", "#192f6a"] as const;
    
  const contentGradientColors = dark 
    ? ["#121212", "#1A1A1A", "#1F1F1F"] as const
    : ["#e0f7fa", "#f5f5f5", "#e3f2fd"] as const;

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
      setRefreshing(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    refreshScansRemaining();
    fetchPrescriptions();
  }, []);

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
          
          // Set optimistic scan update before API call
          setOptimisticScans(scansRemaining !== null ? Math.max(scansRemaining - 1, 0) : null);
          
          try {
            // Using centralized API function with better error handling
            const apiResult = await cameraToApi(newPath);
            
            // Verify that the result is valid and complete
            // Check for required properties to make sure result is valid
            if (!apiResult || typeof apiResult !== 'object') {
              throw new Error('Server returned an invalid response format');
            }
            
            // Create a safe serialized version of the result
            let serializedResult;
            try {
              serializedResult = JSON.stringify(apiResult);
              // Validate the serialized result can be parsed back
              JSON.parse(serializedResult);
            } catch {
              throw new Error('Failed to serialize API response');
            }
            
            router.replace({
              pathname: '/screens/ProcessingResultScreen',
              params: { 
                result: serializedResult,
                imageUri: newPath 
              }
            });
          } catch (apiError) {
            // Restore optimistic update on error
            setOptimisticScans(scansRemaining);
            
            // Use improved error handling
            showErrorAlert(apiError, {
              navigateToHome: false,
              retryAction: () => handleCameraScan(),
              onDismiss: () => {
                // Always refresh scan quota after any attempt
                refreshScansRemaining();
              }
            });
          }
        }
      } catch (err) {
        // Use improved error handling for camera errors
        showErrorAlert(err, {
          title: 'Camera Error',
          onDismiss: () => {
            // Always refresh scan quota after any attempt
            refreshScansRemaining();
          }
        });
      }
      setLoading(false);
    } catch (err) {
      // General error handling
      showErrorAlert(err, {
        title: 'Unexpected Error',
      });
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
          
          // Set optimistic scan update before API call
          setOptimisticScans(scansRemaining !== null ? Math.max(scansRemaining - 1, 0) : null);
          
          try {
            // Using centralized API function with better error handling
            const apiResult = await cameraToApi(newPath);
            
            // Verify that the result is valid and complete
            // Check for required properties to make sure result is valid
            if (!apiResult || typeof apiResult !== 'object') {
              throw new Error('Server returned an invalid response format');
            }
            
            // Create a safe serialized version of the result
            let serializedResult;
            try {
              serializedResult = JSON.stringify(apiResult);
              // Validate the serialized result can be parsed back
              JSON.parse(serializedResult);
            } catch {
              throw new Error('Failed to serialize API response');
            }
            
            router.replace({
              pathname: '/screens/ProcessingResultScreen',
              params: { 
                result: serializedResult,
                imageUri: newPath 
              }
            });
          } catch (apiError) {
            // Restore optimistic update on error
            setOptimisticScans(scansRemaining);
            
            // Use improved error handling
            showErrorAlert(apiError, {
              navigateToHome: false,
              retryAction: () => handleImageUpload(),
              onDismiss: () => {
                // Always refresh scan quota after any attempt
                refreshScansRemaining();
              }
            });
          }
        } catch (err) {
          // Use improved error handling for image picker errors
          showErrorAlert(err, {
            title: 'Image Selection Error',
            onDismiss: () => {
              // Always refresh scan quota after any attempt
              refreshScansRemaining();
            }
          });
        }
        setLoading(false);
      }
    } catch (err) {
      // General error handling
      showErrorAlert(err, {
        title: 'Unexpected Error',
      });
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

  const toggleSelection = (id: string) => {
    setSelectedIds(prevSelectedIds => {
      if (prevSelectedIds.includes(id)) {
        // Remove the ID if already selected
        return prevSelectedIds.filter(selectedId => selectedId !== id);
      } else {
        // Add the ID if not already selected
        return [...prevSelectedIds, id];
      }
    });
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  const handleDelete = async () => {
    if (selectedIds.length === 0) return;
    
    // Confirm deletion
    Alert.alert(
      'Confirm Deletion',
      `Are you sure you want to delete ${selectedIds.length} prescription${selectedIds.length > 1 ? 's' : ''}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              // Delete all selected prescriptions
              let successCount = 0;
              let failureCount = 0;
              
              for (const id of selectedIds) {
                try {
                  // Delete all images from storage first
                  const imageUrls = await getPrescriptionImages(id);
                  for (const url of imageUrls) {
                    await deletePrescriptionImage(url);
                  }
                  
                  // Now delete the prescription from the database
                  const result = await deletePrescription(id);
                  if (result.success) {
                    successCount++;
                  } else {
                    failureCount++;
                  }
                } catch (err) {
                  failureCount++;
                  console.error(`Error deleting prescription ${id}:`, err);
                }
              }
              
              // Update the prescription list
              if (successCount > 0) {
                setPrescriptions((prev) => prev.filter((p) => !selectedIds.includes(p.id)));
              }
              
              // Clear selection
              clearSelection();
              
              // Show results
              if (failureCount === 0) {
                Alert.alert('Deleted', `${successCount} prescription${successCount > 1 ? 's' : ''} deleted successfully.`);
              } else if (successCount === 0) {
                Alert.alert('Error', 'Failed to delete prescriptions.');
              } else {
                Alert.alert('Partial Success', `${successCount} deleted successfully, ${failureCount} failed.`);
              }
            } catch (err) {
              Alert.alert('Error', 'Failed to delete prescriptions.');
              console.error('Bulk deletion error:', err);
            }
          }
        }
      ]
    );
  };

  // Add a function to toggle the notification popup
  const toggleNotificationPopup = () => {
    setNotificationPopupVisible(!notificationPopupVisible);
  };

  // Add function to toggle help modal
  const toggleHelpModal = () => {
    setHelpModalVisible(!helpModalVisible);
  };

  if (user === undefined) {
    return null;
  }

  return (
    <LinearGradient
      colors={dark ? ["#121212", "#121212", "#121212"] as const : ["#4c669f", "#3b5998", "#192f6a"] as const}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.container}>
          <StatusBar backgroundColor={dark ? "#121212" : "#4c669f"} barStyle="light-content" />
          <LinearGradient 
            colors={headerGradientColors} 
            style={styles.header}
          >
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Prescriptions</Text>
              <View style={styles.headerButtons}>
                <TouchableOpacity
                  style={styles.headerIconButton}
                  onPress={() => router.push('/screens/SubscriptionScreen')}
                >
                  <View style={styles.subscriptionBadge}>
                    <Text style={styles.subscriptionBadgeText}>{optimisticScans !== null ? optimisticScans : (scansRemaining || '?')}</Text>
                  </View>
                  <Feather name="file-text" size={22} color="#fff" />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.headerIconButton}
                  onPress={handleRefreshQuota}
                  disabled={refreshingQuota}
                >
                  {refreshingQuota ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Feather name="refresh-cw" size={22} color="#fff" />
                  )}
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.headerIconButton}
                  onPress={toggleHelpModal}
                >
                  <Feather name="help-circle" size={22} color="#fff" />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.headerIconButton}
                  onPress={toggleNotificationPopup}
                >
                  <Feather name="bell" size={22} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
            
            <Searchbar
              placeholder="Search prescriptions..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchbar}
              iconColor={colors.primary}
              inputStyle={[styles.searchInput, { color: dark ? colors.text : '#333' }]}
              placeholderTextColor={dark ? '#aaa' : '#777'}
              theme={{
                colors: { 
                  primary: colors.primary,
                  placeholder: dark ? '#aaa' : '#777'
                }
              }}
            />
          </LinearGradient>

          <LinearGradient
            colors={contentGradientColors}
            style={styles.content}
          >
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Documents</Text>
              {selectedIds.length > 0 && (
                <View style={styles.selectionInfo}>
                  <Text style={[styles.selectionCount, { color: colors.primary }]}>{selectedIds.length} selected</Text>
                  <TouchableOpacity onPress={clearSelection} style={styles.clearSelectionButton}>
                    <Text style={styles.clearSelectionText}>Clear</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
            
            {loading ? (
              <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
            ) : (
              <FlatList
                data={filteredPrescriptions}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <LinearGradient
                    colors={dark 
                      ? ["#1E1E1E", "#252525", "#2A2A2A"] as const
                      : ["#ffffff", "#f8f9fa", "#f0f4f8"] as const
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[
                      styles.prescriptionCard, 
                      selectedIds.includes(item.id) && [
                        styles.selectedCard,
                        { borderColor: colors.primary }
                      ]
                    ]}
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
                            <ActivityIndicator size="small" color={colors.primary} />
                          ) : thumbnails[item.id] ? (
                            <LinearGradient
                              colors={["#43ea2e", "#ffe600"] as const}
                              start={{ x: 0.5, y: 0 }}
                              end={{ x: 0.5, y: 1 }}
                              style={{
                                borderRadius: 8,
                                padding: 2,
                                alignItems: 'center',
                                justifyContent: 'center',
                                elevation: 2,
                              }}
                            >
                              <View style={{
                                backgroundColor: colors.background,
                                borderRadius: 6,
                                width: 60,
                                height: 60,
                                overflow: 'hidden',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}>
                                <Image
                                  source={{ uri: thumbnails[item.id] }}
                                  style={{ width: '100%', height: '100%', borderRadius: 6 }}
                                  resizeMode="cover"
                                />
                              </View>
                            </LinearGradient>
                          ) : (
                            <LinearGradient
                              colors={dark 
                                ? ["#2A2A2A", "#333333"] as const
                                : ["#e1f5fe", "#b3e5fc"] as const
                              }
                              style={{
                                width: 60,
                                height: 60,
                                borderRadius: 8,
                                justifyContent: 'center',
                                alignItems: 'center',
                              }}
                            >
                              <Feather name="file-text" size={24} color={colors.primary} />
                            </LinearGradient>
                          )}
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.docInfo}
                        onPress={() => {
                          clearSelection();
                          router.push({
                            pathname: '/screens/ProcessingResultScreen',
                            params: { result: JSON.stringify(item) }
                          });
                        }}
                      >
                        <Text style={[styles.docTitle, { color: colors.text }]}>{item.patient_name}</Text>
                        <Text style={[styles.docDetails, { color: dark ? '#aaa' : '#666' }]}>Doctor: {item.doctor_name}</Text>
                        <Text style={[styles.docDetails, { color: dark ? '#aaa' : '#666' }]}>Date: {formatDate(item.created_at)}</Text>
                        <Text style={[styles.docDetails, { color: dark ? '#aaa' : '#666' }]}>
                          Medications: {item.medications.length}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.checkbox}
                        onPress={() => toggleSelection(item.id)}
                      >
                        <MaterialIcons
                          name={selectedIds.includes(item.id) ? 'check-box' : 'check-box-outline-blank'}
                          size={24}
                          color={selectedIds.includes(item.id) ? colors.primary : dark ? '#666' : '#bdbdbd'}
                        />
                      </TouchableOpacity>
                    </View>
                  </LinearGradient>
                )}
                style={styles.list}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={[colors.primary, colors.primary, dark ? "#333" : "#192f6a"]}
                    tintColor={colors.primary}
                  />
                }
              />
            )}
            {selectedIds.length > 0 && (
              <TouchableOpacity
                style={{
                  position: 'absolute',
                  bottom: 100,
                  right: 24,
                  backgroundColor: dark ? '#d32f2f' : '#ff4444',
                  borderRadius: 28,
                  padding: 16,
                  elevation: 4,
                  zIndex: 10,
                }}
                onPress={handleDelete}
              >
                <View style={styles.deleteButtonContent}>
                  <MaterialIcons name="delete" size={28} color="#fff" />
                  {selectedIds.length > 1 && (
                    <View style={[styles.deleteCountBadge, {
                      backgroundColor: dark ? '#333' : 'white',
                      borderColor: dark ? '#d32f2f' : '#ff4444',
                    }]}>
                      <Text style={[styles.deleteCountText, {
                        color: dark ? '#ff6666' : '#ff4444',
                      }]}>{selectedIds.length}</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            )}
          </LinearGradient>
        </View>
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleImageUpload}
            disabled={loading}
          >
            <LinearGradient
              colors={actionGradientColors}
              style={styles.actionButtonGradient}
            >
              <Feather name="upload" size={22} color="#fff" style={styles.actionButtonIcon} />
              <Text style={styles.actionButtonText}>Upload</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleCameraScan}
            disabled={loading}
          >
            <LinearGradient
              colors={actionGradientColors}
              style={styles.actionButtonGradient}
            >
              <Feather name="camera" size={22} color="#fff" style={styles.actionButtonIcon} />
              <Text style={styles.actionButtonText}>Scan</Text>
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

        {/* Add notification popup */}
        <NotificationPopup 
          visible={notificationPopupVisible} 
          onClose={() => setNotificationPopupVisible(false)} 
        />

        {/* Help Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={helpModalVisible}
          onRequestClose={toggleHelpModal}
        >
          <View style={styles.modalOverlay}>
            <View style={[
              styles.modalContainer, 
              { backgroundColor: colors.card }
            ]}>
              <View style={[
                styles.modalHeader,
                { borderBottomColor: colors.border }
              ]}>
                <Text style={[
                  styles.modalTitle, 
                  { color: colors.primary }
                ]}>Scan Instructions</Text>
                <TouchableOpacity onPress={toggleHelpModal} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color={colors.primary} />
                </TouchableOpacity>
              </View>
              <View style={styles.modalContent}>
                <ScanInstructions />
              </View>
              <TouchableOpacity 
                style={[
                  styles.modalButton, 
                  { backgroundColor: colors.primary }
                ]} 
                onPress={toggleHelpModal}
              >
                <Text style={styles.modalButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    paddingTop: Platform.OS === 'android' ? 12 : 40,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  subscriptionBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#43ea2e',
    borderRadius: 10,
    height: 18,
    minWidth: 18,
    paddingHorizontal: 3,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  subscriptionBadgeText: {
    color: '#333',
    fontSize: 11,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 22,
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
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    elevation: 2,
    height: 40,
    padding: 0,
    alignItems: 'center',
  },
  searchInput: {
    color: '#333',
    fontSize: 14,
    height: 40,
    textAlignVertical: 'center',
    paddingVertical: 0,
    marginVertical: 0,
    alignSelf: 'center',
    top: Platform.OS === 'android' ? -2 : 0,
  },
  content: {
    flex: 1,
    padding: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    marginLeft: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  selectionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectionCount: {
    fontSize: 14,
    color: '#4c669f',
    fontWeight: 'bold',
    marginRight: 8,
  },
  clearSelectionButton: {
    padding: 4,
  },
  clearSelectionText: {
    fontSize: 14,
    color: '#ff4444',
    fontWeight: 'bold',
  },
  list: {
    flex: 1,
  },
  prescriptionCard: {
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  docIcon: {
    width: 64,
    height: 64,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  docInfo: {
    flex: 1,
    marginLeft: 12,
  },
  docTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  docDetails: {
    fontSize: 12,
    color: '#666',
    marginBottom: 1,
    lineHeight: 16,
  },
  checkbox: {
    padding: 4,
  },
  actionButtonsContainer: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    width: 110,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    elevation: 4,
  },
  actionButtonGradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  actionButtonIcon: {
    marginRight: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: '#4c669f',
  },
  deleteButtonContent: {
    position: 'relative',
  },
  deleteCountBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'white',
    borderRadius: 12,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ff4444',
  },
  deleteCountText: {
    color: '#ff4444',
    fontSize: 12,
    fontWeight: 'bold',
  },
  gradientContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 4,
    paddingBottom: 80, // Add padding at bottom to avoid FAB overlap
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    borderRadius: 16,
    padding: 16,
    width: '85%',
    maxWidth: 360,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    paddingBottom: 5,
  },
  modalButton: {
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginTop: 5,
    elevation: 2,
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 