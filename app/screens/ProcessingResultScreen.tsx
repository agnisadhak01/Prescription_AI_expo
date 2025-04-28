import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Image, Dimensions, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Text, Card, Surface, Divider, useTheme, Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { savePrescription } from '@/components/prescriptionService';
import { useAuth } from '@/components/AuthContext';
import { Feather } from '@expo/vector-icons';
import ImageViewing from 'react-native-image-viewing';

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
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saveAttempted, setSaveAttempted] = useState(false);
  const params = useLocalSearchParams();
  
  // Determine mode: 'view' (from history/db) or 'save' (after OCR)
  const mode = params.mode === 'view' || (typeof params.result === 'string' && JSON.parse(params.result)?.id) ? 'view' : 'save';
  
  // Handle both string and object params
  const prescriptionData = typeof params.result === 'string'
    ? JSON.parse(params.result as string)
    : (params.result as any);
    
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
  const patient = normalizedPrescription.patient_details || {};
  const doctor = normalizedPrescription.doctor_details || {};
  const medications = normalizedPrescription.medications || [];
  const generalInstructions = normalizedPrescription.general_instructions || (normalizedPrescription as any)?.diagnosis || '';
  const additionalInfo = normalizedPrescription.additional_info || (normalizedPrescription as any)?.notes || '';

  // Helper to show 'Not available' for empty fields
  const showValue = (val: any) => (val === undefined || val === null || val === '' ? 'Not available' : val);

  // Find prescription image from DB if available
  let dbImageUrl = undefined;
  if (Array.isArray((normalizedPrescription as any).prescription_images) && (normalizedPrescription as any).prescription_images.length > 0) {
    dbImageUrl = (normalizedPrescription as any).prescription_images[0].image_url;
  }
  // State for image viewer modal
  const [imageViewerVisible, setImageViewerVisible] = useState(false);

  const handleSave = async () => {
    if (!user) {
      Alert.alert('Error', 'No user logged in. Please log in and try again.');
      return;
    }
    // Only validate in 'save' mode
    if (mode === 'save') {
      if (!doctor.name || doctor.name.trim().length < 2) {
        Alert.alert('Validation Error', 'Doctor name is required and should be at least 2 characters.');
        return;
      }
      if (!patient.name || patient.name.trim().length < 2) {
        Alert.alert('Validation Error', 'Patient name is required and should be at least 2 characters.');
        return;
      }
      if (!Array.isArray(medications) || medications.length === 0) {
        Alert.alert('Validation Error', 'At least one medication is required.');
        return;
      }
      for (let i = 0; i < medications.length; i++) {
        const med = medications[i];
        const medName = med.brand_name || med.medicineName;
        if (!medName || medName.trim().length < 2) {
          Alert.alert('Validation Error', `Medication ${i + 1} must have a valid name (at least 2 characters).`);
          return;
        }
        if (
          !med.dosage && !med.strength &&
          !med.frequency &&
          !med.duration
        ) {
          Alert.alert('Validation Error', `Medication ${i + 1} must have at least one of dosage, frequency, or duration.`);
          return;
        }
      }
    }
    try {
      setSaving(true);
      const prescriptionToSave = {
        user_id: user.id,
        doctor_name: doctor.name || '',
        patient_name: patient.name || '',
        date: new Date().toISOString().split('T')[0],
        diagnosis: generalInstructions,
        notes: additionalInfo,
        image_uri: normalizedPrescription.image_uri, // Pass the image URI for upload
        medications: medications.map(med => ({
          name: med.brand_name || med.medicineName || '',
          dosage: med.dosage || med.strength || '',
          frequency: med.frequency || '',
          duration: med.duration || '',
          instructions: med.instructions || ''
        }))
      };
      console.log('Saving prescription:', prescriptionToSave);

      const result = await savePrescription(prescriptionToSave);
      setSaving(false);
      setSaveAttempted(true);
      if (result.success) {
        Alert.alert('Success', 'Prescription saved successfully!');
        // Do not navigate away automatically
        // router.replace('/(tabs)');
      } else {
        Alert.alert('Error', 'Failed to save prescription. Please try again.');
        console.error('Failed to save prescription:', result.error);
      }
    } catch (error) {
      setSaving(false);
      setSaveAttempted(true);
      Alert.alert('Error', 'An error occurred while saving. Please try again.');
      console.error('Error saving prescription:', error);
    }
  };

  // Autosave only in 'save' mode
  useEffect(() => {
    if (mode === 'save' && !saveAttempted) {
      handleSave();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <LinearGradient
      colors={["#4c669f", "#3b5998", "#192f6a"]}
      style={styles.gradientBg}
    >
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Prescription Details</Text>

        {/* Display the prescription image if available */}
        {(dbImageUrl || normalizedPrescription.image_uri) && (
          <Card style={styles.card} elevation={4}>
            <LinearGradient colors={["#614385", "#516395"]} style={styles.cardHeader}>
              <Text style={styles.cardHeaderText}>Prescription Image</Text>
            </LinearGradient>
            <Card.Content style={styles.imageContainer}>
              <TouchableOpacity onPress={() => setImageViewerVisible(true)}>
                <Image
                  source={{ uri: dbImageUrl || normalizedPrescription.image_uri }}
                  style={styles.prescriptionImage}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </Card.Content>
          </Card>
        )}

        {/* Full-screen zoomable image viewer */}
        <ImageViewing
          images={[{ uri: dbImageUrl || normalizedPrescription.image_uri }]}
          imageIndex={0}
          visible={imageViewerVisible}
          onRequestClose={() => setImageViewerVisible(false)}
          swipeToCloseEnabled={true}
          doubleTapToZoomEnabled={true}
        />

        <Card style={styles.card} elevation={4}>
          <LinearGradient colors={["#6dd5ed", "#2193b0"]} style={styles.cardHeader}>
            <Text style={styles.cardHeaderText}>Patient Information</Text>
          </LinearGradient>
          <Card.Content>
            <Text style={styles.infoText}><Text style={styles.label}>Name:</Text> {showValue(patient.name)}</Text>
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

        {saving && (
          <View style={{ marginTop: 20, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#4c669f" />
            <Text style={{ color: '#4c669f', marginTop: 8 }}>Saving prescription...</Text>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBg: {
    flex: 1,
  },
  container: {
    padding: 16,
    paddingBottom: 32,
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
    marginTop: 20,
    marginBottom: 20,
    backgroundColor: '#4c669f',
  },
  saveButtonContent: {
    paddingVertical: 8,
  },
  prescriptionImage: {
    width: '100%',
    height: 300,
    borderRadius: 8,
  },
  imageContainer: {
    alignItems: 'center',
    padding: 10,
  },
}); 