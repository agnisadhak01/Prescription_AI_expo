import React, { useEffect, useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet, Image, Dimensions, Alert, ActivityIndicator, TouchableOpacity, BackHandler, StatusBar, Platform } from 'react-native';
import { Text, Card, Surface, Divider, useTheme, Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter, router as globalRouter, useFocusEffect } from 'expo-router';
import { savePrescription, checkPrescriptionExists } from '@/components/prescriptionService';
import { useAuth } from '@/components/AuthContext';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import ImageViewing from 'react-native-image-viewing';
import { getSignedPrescriptionImageUrl } from '@/components/storageService';
import { supabase } from '@/components/supabaseClient';
import VerificationPrompt from '@/components/ui/VerificationPrompt';
import DisclaimerComponent from '@/components/ui/DisclaimerComponent';
import { AppStatusBar, getStatusBarHeight } from '@/components/ui/AppStatusBar';
import { showErrorAlert } from '@/components/utils/errorHandler';

const { width } = Dimensions.get('window');

// TypeScript interfaces for prescription data
interface Medication {
  brand_name?: string;
  medicineName?: string;
  generic_name?: string;
  genericName?: string;
  dosage?: string;
  strength?: string;
  frequency?: string;
  duration?: string;
  purpose?: string;
  instructions?: string;
  side_effects?: string;
  precautions?: string;
}

interface PatientDetails {
  name?: string;
  age?: string | number;
  patient_id?: string;
  contact?: string;
  address?: string;
}

interface DoctorDetails {
  name?: string;
  specialization?: string;
  license_number?: string;
  contact?: string;
  chambers?: string;
  visiting_hours?: string;
}

interface Prescription {
  patient_details?: PatientDetails;
  doctor_details?: DoctorDetails;
  medications?: Medication[];
  general_instructions?: string;
  additional_info?: string;
  image_uri?: string; // Add image URI from camera/gallery
}

export default function ProcessingResultScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user, refreshScansRemaining, scansRemaining } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saveAttempted, setSaveAttempted] = useState(false);
  const params = useLocalSearchParams();
  const [optimisticScans, setOptimisticScans] = useState<number | null>(null);
  const [verified, setVerified] = useState(false);
  const [processingError, setProcessingError] = useState<Error | null>(null);
  const [isErrorHandled, setIsErrorHandled] = useState(false);
  
  // Determine mode: 'view' (from history/db) or 'save' (after OCR)
  const mode = params.mode === 'view' || (typeof params.result === 'string' && (() => {
    try {
      return JSON.parse(params.result as string)?.id;
    } catch (e) {
      return false;
    }
  })()) ? 'view' : 'save';
  
  // Handle both string and object params
  const prescriptionData = useMemo(() => {
    try {
      // Try to parse the result as JSON if it's a string
      if (typeof params.result === 'string') {
        return JSON.parse(params.result as string);
      } else {
        // Already an object
        return params.result as any;
      }
    } catch (parseError) {
      // Handle JSON parse errors
      console.error('Error parsing prescription data:', parseError);
      setProcessingError(parseError as Error);
      
      // Return a minimal valid object to prevent rendering errors
      return { 
        error: true, 
        patient_details: { name: '' },
        doctor_details: { name: '' },
        medications: [],
        general_instructions: 'Error processing prescription',
        additional_info: ''
      };
    }
  }, [params.result]);
  
  // Handle processing errors immediately when detected
  useEffect(() => {
    if (processingError && !isErrorHandled) {
      showErrorAlert(processingError, {
        title: 'Processing Error',
        navigateToHome: true,
        navigateHome: () => {
          try {
            globalRouter.replace('/(tabs)');
          } catch (error) {
            console.error('Navigation error:', error);
          }
        }
      });
      setIsErrorHandled(true);
    }
  }, [processingError, isErrorHandled]);
  
  // Get image URI if it exists
  const imageUri = params.imageUri as string | undefined;
  
  const prescription: Prescription = {
    ...prescriptionData,
    image_uri: imageUri
  };

  // Map flat DB fields to nested structure if needed
  let normalizedPrescription = { ...prescription };
  if (!prescription.patient_details && (prescription as any).patient_name) {
    normalizedPrescription.patient_details = {
      name: (prescription as any).patient_name,
      age: (prescription as any).patient_age,
      patient_id: (prescription as any).patient_id,
      contact: (prescription as any).patient_contact,
      address: (prescription as any).patient_address,
    };
  }
  if (!prescription.doctor_details && (prescription as any).doctor_name) {
    normalizedPrescription.doctor_details = {
      name: (prescription as any).doctor_name,
      specialization: (prescription as any).doctor_specialization,
      license_number: (prescription as any).doctor_license,
      contact: (prescription as any).doctor_contact,
      chambers: (prescription as any).doctor_chambers,
      visiting_hours: (prescription as any).doctor_visiting_hours,
    };
  }
  // Use normalizedPrescription for all further logic
  // if (__DEV__) console.log('Prescription Details Debug:', normalizedPrescription);
  const patient = normalizedPrescription.patient_details || {};
  const doctor = normalizedPrescription.doctor_details || {};
  const medications = normalizedPrescription.medications || [];
  const generalInstructions = normalizedPrescription.general_instructions || (normalizedPrescription as any)?.diagnosis || '';
  const additionalInfo = normalizedPrescription.additional_info || (normalizedPrescription as any)?.notes || '';

  // Helper to show 'Not available' for empty fields
  const showValue = (val: any, fieldType?: string) => {
    if (val === undefined || val === null || val === '' || (typeof val === 'string' && val.trim().length < 2)) {
      // Use "Not readable" specifically for patient name
      if (fieldType === 'patient_name') {
        return 'Not readable';
      }
      return 'Not available';
    }
    return val;
  };

  // Find prescription image from DB if available
  const [displayImageUrl, setDisplayImageUrl] = useState<string | undefined>(undefined);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchSignedUrl = async () => {
      setImageLoading(true);
      let filePath: string | undefined = undefined;
      
      // Use only necessary debug logs
      // if (__DEV__) {
      //   console.log('Image Data Check:', {
      //     imageUri: normalizedPrescription.image_uri,
      //     prescriptionImages: (normalizedPrescription as any).prescription_images,
      //     imageUrl: (normalizedPrescription as any).image_url
      //   });
      // }
      
      // Check all possible locations for the image
      if (Array.isArray((normalizedPrescription as any).prescription_images) && 
          (normalizedPrescription as any).prescription_images.length > 0) {
        filePath = (normalizedPrescription as any).prescription_images[0].image_url;
      } else if ((normalizedPrescription as any).image_url) {
        filePath = (normalizedPrescription as any).image_url;
      }
      
      if (filePath) {
        try {
          // Get a longer-lived signed URL (3 hours instead of default 1 hour)
          const signedUrl = await getSignedPrescriptionImageUrl(filePath, 10800);
          
          if (isMounted) {
            // Add cache-busting query param if URL exists
            if (signedUrl) {
              const urlWithCacheBuster = `${signedUrl}${signedUrl.includes('?') ? '&' : '?'}cache=${Date.now()}`;
              setDisplayImageUrl(urlWithCacheBuster);
            } else {
              setDisplayImageUrl(undefined);
              // console.error('Failed to get signed URL for path:', filePath);
            }
          }
          // if (__DEV__) console.log('Signed URL:', signedUrl);
        } catch (error) {
          // console.error('Error getting signed URL:', error);
          // Try direct path as fallback
          if (isMounted) {
            const publicUrl = supabase.storage.from('prescription-images').getPublicUrl(filePath).data.publicUrl;
            if (publicUrl) {
              const urlWithCacheBuster = `${publicUrl}${publicUrl.includes('?') ? '&' : '?'}cache=${Date.now()}`;
              setDisplayImageUrl(urlWithCacheBuster);
              // console.log('Using public URL as fallback');
            } else {
              setDisplayImageUrl(undefined);
            }
          }
        }
      } else if (normalizedPrescription.image_uri) {
        setDisplayImageUrl(normalizedPrescription.image_uri);
        // if (__DEV__) console.log('Using direct image URI:', normalizedPrescription.image_uri);
      } else {
        setDisplayImageUrl(undefined);
        // if (__DEV__) console.log('No image URL available');
      }
      setImageLoading(false);
    };
    fetchSignedUrl();
    return () => { isMounted = false; };
  }, [normalizedPrescription.image_uri, 
      // Use stable reference checks for arrays and objects
      JSON.stringify((normalizedPrescription as any).prescription_images),
      (normalizedPrescription as any).image_url]);

  useEffect(() => {
    // When scansRemaining changes, update optimisticScans
    setOptimisticScans(scansRemaining);
  }, [scansRemaining]);

  // Handle user verification
  const handleVerify = () => {
    setVerified(true);
  };

  const handleSave = async () => {
    // If not verified, show alert
    if (!verified && mode === 'save') {
      Alert.alert(
        "Verification Required",
        "Please verify the extracted information before saving. The AI may not have extracted all details correctly.",
        [{ text: "OK", style: "default" }]
      );
      return;
    }

    if (!user) {
      Alert.alert('Error', 'No user logged in. Please log in and try again.', [
        { text: 'OK', onPress: () => navigateToHome() }
      ]);
      return;
    }
    // Only validate doctor name in 'save' mode
    if (mode === 'save') {
      if (!doctor.name || doctor.name.trim().length < 2) {
        Alert.alert('Validation Error', 'Doctor name is required and should be at least 2 characters.', [
          { text: 'Go Back', onPress: () => navigateToHome() },
          { text: 'Edit', style: 'cancel' }
        ]);
        return;
      }
      // Remove patient name validation - we'll handle missing patient names gracefully
    }
    
    if (saveAttempted) {
      // If already saved, check if we're trying to save again
      Alert.alert(
        'Already Saved',
        'This prescription has already been saved to your history.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }
    
    try {
      setSaving(true);
      
      // First call the process_prescription RPC to ensure quota is used
      // Regardless of whether prescription is valid or not
      const { data: scanProcessed, error: scanError } = await supabase.rpc('process_prescription', { 
        user_id: user.id 
      });
      
      if (scanError) {
        console.error('Scan processing error:', scanError);
        showErrorAlert(scanError, {
          title: 'Processing Error',
          onDismiss: () => {
            setSaving(false);
            setSaveAttempted(true);
          }
        });
        return;
      }
      
      // Optimistically decrement quota
      setOptimisticScans((prev) => (prev !== null ? Math.max(prev - 1, 0) : null));
      
      // Set default patient name if missing or too short
      const patientName = (!patient.name || patient.name.trim().length < 2) 
        ? 'Not readable' 
        : patient.name;
      
      const prescriptionToSave = {
        user_id: user.id,
        doctor_name: doctor.name || '',
        patient_name: patientName, // Use defaulted patient name
        date: new Date().toISOString().split('T')[0],
        diagnosis: generalInstructions,
        notes: additionalInfo,
        image_uri: normalizedPrescription.image_uri, // Pass the image URI for upload
        medications: Array.isArray(medications) ? medications.map(med => ({
          name: med.brand_name || med.medicineName || '',
          dosage: med.dosage || med.strength || '',
          frequency: med.frequency || '',
          duration: med.duration || '',
          instructions: med.instructions || ''
        })) : [] // Ensure we have a valid array even if no medications
      };
      
      const result = await savePrescription(prescriptionToSave);
      setSaving(false);
      setSaveAttempted(true);
      
      if (!result.success) {
        if (result.isDuplicate) {
          Alert.alert('Already Exists', 'This prescription has already been saved to your history.');
        } else {
          showErrorAlert(result.error || new Error('Failed to save prescription'), {
            title: 'Save Error'
          });
        }
      } else {
        Alert.alert('Success', 'Prescription saved successfully!');
        // Refresh global scan quota after successful save
        await refreshScansRemaining();
      }
    } catch (error) {
      setSaving(false);
      setSaveAttempted(true);
      showErrorAlert(error, {
        title: 'Save Error',
        onDismiss: () => refreshScansRemaining()
      });
    }
  };

  // Improved navigation to home screen
  const navigateToHome = () => {
    try {
      globalRouter.replace('/(tabs)');
    } catch (error) {
      // console.error('Navigation error:', error);
    }
  };

  // Process prescription when component mounts in 'save' mode
  useEffect(() => {
    if (mode === 'save' && !saveAttempted) {
      // Process prescription to deduct quota and save data automatically
      handleSave();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle back button presses - prevent app from closing
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        // Show confirmation dialog if in 'save' mode
        if (mode === 'save' && !saveAttempted) {
          Alert.alert(
            'Discard Prescription?',
            'Are you sure you want to go back? Any changes will be lost.',
            [
              { text: 'Stay', style: 'cancel' },
              { 
                text: 'Discard', 
                onPress: () => navigateToHome(),
                style: 'destructive' 
              }
            ]
          );
          return true; // Prevents default behavior
        } else {
          // Simply navigate back to home if already saved or in view mode
          navigateToHome();
          return true; // Prevents default behavior
        }
      };

      // Add back button listener
      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      
      // Clean up listener when component unmounts
      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [mode, saveAttempted])
  );

  return (
    <LinearGradient
      colors={["#4c669f", "#3b5998", "#192f6a"]}
      style={styles.gradientBg}
    >
      <AppStatusBar />
      <ScrollView 
        contentContainerStyle={styles.container} 
        showsVerticalScrollIndicator={false}
      >
        {/* Add medical disclaimer at the top */}
        {mode === 'save' && (
          <DisclaimerComponent type="medical" style={styles.disclaimer} />
        )}

        <Text style={styles.title}>Prescription Details</Text>

        {/* Display the prescription image if available */}
        {imageLoading ? (
          <ActivityIndicator size="large" color="#4c669f" style={{ marginVertical: 24 }} />
        ) : (
          <Card style={styles.card} elevation={4}>
            <LinearGradient colors={["#614385", "#516395"]} style={styles.cardHeader}>
              <Text style={styles.cardHeaderText}>Prescription Image</Text>
            </LinearGradient>
            <Card.Content style={styles.imageContainer}>
              {displayImageUrl ? (
                <TouchableOpacity onPress={() => setImageViewerVisible(true)}>
                  <LinearGradient
                    colors={["#43ea2e", "#ffe600"]} // top green, bottom yellow
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                    style={{
                      borderRadius: 12,
                      padding: 3,
                      alignSelf: 'center',
                      marginBottom: 8,
                    }}
                  >
                    <View style={{
                      backgroundColor: '#fff',
                      borderRadius: 9,
                      width: 300,
                      height: 300,
                      overflow: 'hidden',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                      <Image
                        key={displayImageUrl}
                        source={{ uri: displayImageUrl }}
                        style={{ width: '100%', height: '100%', borderRadius: 9 }}
                        resizeMode="contain"
                        onError={(e) => {
                          // console.error('Image loading error:', e.nativeEvent.error);
                          // console.error('Failed image URL:', displayImageUrl);
                          // if (__DEV__) {
                          //   console.log('Failed image URL:', displayImageUrl);
                          //   Alert.alert('Image Error', `Failed to load image: ${e.nativeEvent.error}\nURL: ${displayImageUrl ? displayImageUrl.substring(0, 30) + '...' : 'undefined'}`);
                          // }
                        }}
                        onLoad={(e) => {
                          // console.log('Image loaded successfully:', displayImageUrl, e.nativeEvent.source);
                        }}
                      />
                    </View>
                  </LinearGradient>
                  <View style={{ marginTop: 5, padding: 10, backgroundColor: '#f0f0f0', borderRadius: 5 }}>
                    <Text style={{ fontSize: 11, color: '#333' }}>Image URL exists - tap to view</Text>
                  </View>
                </TouchableOpacity>
              ) : (
                <View style={styles.noImageContainer}>
                  <Feather name="image" size={50} color="#ccc" />
                  <Text style={styles.noImageText}>No image available</Text>
                </View>
              )}
            </Card.Content>
          </Card>
        )}

        {/* Full-screen zoomable image viewer with improved error handling */}
        <ImageViewing
          images={displayImageUrl ? [{ uri: displayImageUrl }] : []}
          imageIndex={0}
          visible={imageViewerVisible}
          onRequestClose={() => setImageViewerVisible(false)}
          swipeToCloseEnabled={true}
          doubleTapToZoomEnabled={true}
          presentationStyle="overFullScreen"
        />

        {/* Process Results Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>Processing Results</Text>
          {mode === 'save' && (
            <Text style={styles.subheaderText}>
              Please verify the extracted information below before saving
            </Text>
          )}
        </View>

        <Card style={styles.card} elevation={4}>
          <LinearGradient colors={["#6dd5ed", "#2193b0"]} style={styles.cardHeader}>
            <Text style={styles.cardHeaderText}>Patient Information</Text>
          </LinearGradient>
          <Card.Content>
            <Text style={styles.infoText}><Text style={styles.label}>Name:</Text> {showValue(patient.name, 'patient_name')}</Text>
            <Text style={styles.infoText}><Text style={styles.label}>Age:</Text> {showValue(patient.age)}</Text>
            <Text style={styles.infoText}><Text style={styles.label}>ID:</Text> {showValue(patient.patient_id)}</Text>
            <Text style={styles.infoText}><Text style={styles.label}>Contact:</Text> {showValue(patient.contact)}</Text>
            <Text style={styles.infoText}><Text style={styles.label}>Address:</Text> {showValue(patient.address)}</Text>
          </Card.Content>
        </Card>

        <Card style={styles.card} elevation={4}>
          <LinearGradient colors={["#f7971e", "#ffd200"]} style={styles.cardHeader}>
            <Text style={styles.cardHeaderText}>Doctor Information</Text>
          </LinearGradient>
          <Card.Content>
            <Text style={styles.infoText}><Text style={styles.label}>Name:</Text> {showValue(doctor.name)}</Text>
            <Text style={styles.infoText}><Text style={styles.label}>Specialization:</Text> {showValue(doctor.specialization)}</Text>
            <Text style={styles.infoText}><Text style={styles.label}>License:</Text> {showValue(doctor.license_number)}</Text>
            <Text style={styles.infoText}><Text style={styles.label}>Contact:</Text> {showValue(doctor.contact)}</Text>
            <Text style={styles.infoText}><Text style={styles.label}>Chambers:</Text> {showValue(doctor.chambers)}</Text>
            <Text style={styles.infoText}><Text style={styles.label}>Visiting Hours:</Text> {showValue(doctor.visiting_hours)}</Text>
          </Card.Content>
        </Card>

        <Card style={styles.card} elevation={4}>
          <LinearGradient colors={["#43cea2", "#185a9d"]} style={styles.cardHeader}>
            <Text style={styles.cardHeaderText}>Medications</Text>
          </LinearGradient>
          <Card.Content>
            {medications.length === 0 && <Text style={styles.infoText}>No medications found.</Text>}
            {medications.map((med: Medication, idx: number) => (
              <Surface key={idx} style={styles.medicationSurface} elevation={2}>
                <Text style={styles.medicationName}>{showValue((med as any).name || med.brand_name || med.medicineName)}</Text>
                <Divider style={styles.divider} />
                <Text style={styles.medicationDetail}><Text style={styles.label}>Generic:</Text> {showValue(med.generic_name || med.genericName)}</Text>
                <Text style={styles.medicationDetail}><Text style={styles.label}>Dosage:</Text> {showValue(med.dosage || med.strength)}</Text>
                <Text style={styles.medicationDetail}><Text style={styles.label}>Frequency:</Text> {showValue(med.frequency)}</Text>
                <Text style={styles.medicationDetail}><Text style={styles.label}>Duration:</Text> {showValue(med.duration)}</Text>
                <Text style={styles.medicationDetail}><Text style={styles.label}>Purpose:</Text> {showValue(med.purpose)}</Text>
                <Text style={styles.medicationDetail}><Text style={styles.label}>Instructions:</Text> {showValue(med.instructions)}</Text>
                <Text style={styles.medicationDetail}><Text style={styles.label}>Side Effects:</Text> {showValue(med.side_effects)}</Text>
                <Text style={styles.medicationDetail}><Text style={styles.label}>Precautions:</Text> {showValue(med.precautions)}</Text>
              </Surface>
            ))}
          </Card.Content>
        </Card>

        <Card style={styles.card} elevation={4}>
          <LinearGradient colors={["#ff9966", "#ff5e62"]} style={styles.cardHeader}>
            <Text style={styles.cardHeaderText}>General Instructions</Text>
          </LinearGradient>
          <Card.Content>
            <Text style={styles.infoText}>{showValue(generalInstructions)}</Text>
          </Card.Content>
        </Card>

        <Card style={styles.card} elevation={4}>
          <LinearGradient colors={["#c471f5", "#fa71cd"]} style={styles.cardHeader}>
            <Text style={styles.cardHeaderText}>Additional Info</Text>
          </LinearGradient>
          <Card.Content>
            <Text style={styles.infoText}>{showValue(additionalInfo)}</Text>
          </Card.Content>
        </Card>

        {/* Add verification prompt here, at the bottom of the results */}
        {mode === 'save' && (
          <VerificationPrompt onVerify={handleVerify} />
        )}

        {/* AI accuracy disclaimer before buttons */}
        {mode === 'save' && (
          <DisclaimerComponent type="ai" style={styles.disclaimer} />
        )}

        {/* Manual Save Button - Only show if in view mode or if verified in save mode */}
        {((mode === 'view') || (mode === 'save' && verified)) && (
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              icon="content-save"
              loading={saving}
              disabled={saving || saveAttempted}
              style={[styles.saveButton, saveAttempted && styles.savedButton]}
              labelStyle={{ color: '#fff', fontWeight: 'bold' }}
              onPress={handleSave}
            >
              {saveAttempted ? 'Prescription Saved' : 'Save Prescription'}
            </Button>
            {mode === 'save' && (
              <Text style={styles.buttonInfo}>
                {verified 
                  ? "Thank you for verifying. The prescription has been auto-saved." 
                  : "Please verify the accuracy of the information above."}
              </Text>
            )}
          </View>
        )}

        {/* Back to Home button */}
        {mode === 'view' && (
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              icon="home"
              onPress={navigateToHome}
              style={styles.saveButton}
            >
              Back to Home
            </Button>
          </View>
        )}

        {/* Final disclaimer notice */}
        <Text style={styles.legalNotice}>
          This app is not intended for medical use and not a medical device. 
          Always consult healthcare professionals for medical advice.
        </Text>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBg: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    padding: 16,
    paddingTop: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 24,
    textAlign: 'center',
    letterSpacing: 1.2,
    textShadowColor: '#0006',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  card: {
    borderRadius: 18,
    marginBottom: 20,
    overflow: 'hidden',
  },
  cardHeader: {
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  cardHeaderText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 1.1,
    textShadowColor: '#0004',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  infoText: {
    fontSize: 15,
    marginBottom: 4,
    color: '#333',
  },
  label: {
    fontWeight: 'bold',
    color: '#4c669f',
  },
  medicationSurface: {
    marginBottom: 14,
    padding: 12,
    backgroundColor: '#f0f4fa',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  medicationName: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
    color: '#185a9d',
  },
  medicationDetail: {
    fontSize: 14,
    color: '#444',
    marginBottom: 2,
  },
  divider: {
    marginVertical: 6,
    backgroundColor: '#b3c6e0',
    height: 1,
  },
  saveButton: {
    backgroundColor: '#4c669f',
    marginVertical: 16,
    borderRadius: 8,
    paddingVertical: 8,
  },
  savedButton: {
    backgroundColor: '#4CAF50', // Green color for saved state
  },
  imageContainer: {
    alignItems: 'center',
    padding: 10,
    minHeight: 200,
  },
  noImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    width: '100%',
  },
  noImageText: {
    marginTop: 10,
    color: '#999',
    fontSize: 16,
  },
  disclaimer: {
    marginVertical: 12,
  },
  headerContainer: {
    marginVertical: 16,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subheaderText: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.8,
  },
  buttonInfo: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 12,
    fontStyle: 'italic',
    opacity: 0.7,
  },
  legalNotice: {
    marginVertical: 24,
    paddingHorizontal: 16,
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
    opacity: 0.7,
  },
  buttonContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
}); 