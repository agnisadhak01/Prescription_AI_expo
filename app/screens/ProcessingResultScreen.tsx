import React, { useEffect } from 'react';
import { View, ScrollView, StyleSheet, Image, Dimensions } from 'react-native';
import { Text, Card, Surface, Divider, useTheme, Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { savePrescription } from '@/components/prescriptionService';
import { useAuth } from '@/components/AuthContext';

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
}

export default function ProcessingResultScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const prescription: Prescription = typeof params.result === 'string'
    ? JSON.parse(params.result as string)
    : (params.result as Prescription);

  const patient = prescription.patient_details || {};
  const doctor = prescription.doctor_details || {};
  const medications = prescription.medications || [];
  const generalInstructions = prescription.general_instructions || '';
  const additionalInfo = prescription.additional_info || '';

  const handleSave = async () => {
    if (!user) {
      alert('No user logged in.');
      return;
    }

    // Enhanced validation
    if (!doctor.name || doctor.name.trim().length < 2) {
      alert('Doctor name is required and should be at least 2 characters.');
      return;
    }
    if (!patient.name || patient.name.trim().length < 2) {
      alert('Patient name is required and should be at least 2 characters.');
      return;
    }
    if (!Array.isArray(medications) || medications.length === 0) {
      alert('At least one medication is required.');
      return;
    }
    for (let i = 0; i < medications.length; i++) {
      const med = medications[i];
      const medName = med.brand_name || med.medicineName;
      if (!medName || medName.trim().length < 2) {
        alert(`Medication ${i + 1} must have a valid name (at least 2 characters).`);
        return;
      }
      if (
        !med.dosage && !med.strength &&
        !med.frequency &&
        !med.duration
      ) {
        alert(`Medication ${i + 1} must have at least one of dosage, frequency, or duration.`);
        return;
      }
    }

    try {
      const prescriptionData = {
        user_id: user.id,
        doctor_name: doctor.name || '',
        patient_name: patient.name || '',
        date: new Date().toISOString().split('T')[0],
        diagnosis: generalInstructions,
        notes: additionalInfo,
        medications: medications.map(med => ({
          name: med.brand_name || med.medicineName || '',
          dosage: med.dosage || med.strength || '',
          frequency: med.frequency || '',
          duration: med.duration || '',
          instructions: med.instructions || ''
        }))
      };

      const result = await savePrescription(prescriptionData);
      if (result.success) {
        alert('Prescription saved successfully!');
        router.replace('/(tabs)/index');
      } else {
        alert('Failed to save prescription. Please try again.');
        console.error('Failed to save prescription:', result.error);
      }
    } catch (error) {
      alert('An error occurred while saving. Please try again.');
      console.error('Error saving prescription:', error);
    }
  };

  return (
    <LinearGradient
      colors={["#4c669f", "#3b5998", "#192f6a"]}
      style={styles.gradientBg}
    >
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Prescription Details</Text>

        <Card style={styles.card} elevation={4}>
          <LinearGradient colors={["#6dd5ed", "#2193b0"]} style={styles.cardHeader}>
            <Text style={styles.cardHeaderText}>Patient Information</Text>
          </LinearGradient>
          <Card.Content>
            <Text style={styles.infoText}><Text style={styles.label}>Name:</Text> {patient.name}</Text>
            <Text style={styles.infoText}><Text style={styles.label}>Age:</Text> {patient.age}</Text>
            <Text style={styles.infoText}><Text style={styles.label}>ID:</Text> {patient.patient_id}</Text>
            <Text style={styles.infoText}><Text style={styles.label}>Contact:</Text> {patient.contact}</Text>
            <Text style={styles.infoText}><Text style={styles.label}>Address:</Text> {patient.address}</Text>
          </Card.Content>
        </Card>

        <Card style={styles.card} elevation={4}>
          <LinearGradient colors={["#f7971e", "#ffd200"]} style={styles.cardHeader}>
            <Text style={styles.cardHeaderText}>Doctor Information</Text>
          </LinearGradient>
          <Card.Content>
            <Text style={styles.infoText}><Text style={styles.label}>Name:</Text> {doctor.name}</Text>
            <Text style={styles.infoText}><Text style={styles.label}>Specialization:</Text> {doctor.specialization}</Text>
            <Text style={styles.infoText}><Text style={styles.label}>License:</Text> {doctor.license_number}</Text>
            <Text style={styles.infoText}><Text style={styles.label}>Contact:</Text> {doctor.contact}</Text>
            <Text style={styles.infoText}><Text style={styles.label}>Chambers:</Text> {doctor.chambers}</Text>
            <Text style={styles.infoText}><Text style={styles.label}>Visiting Hours:</Text> {doctor.visiting_hours}</Text>
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
                <Text style={styles.medicationName}>{med.brand_name || med.medicineName}</Text>
                <Divider style={styles.divider} />
                <Text style={styles.medicationDetail}><Text style={styles.label}>Generic:</Text> {med.generic_name || med.genericName}</Text>
                <Text style={styles.medicationDetail}><Text style={styles.label}>Dosage:</Text> {med.dosage || med.strength}</Text>
                <Text style={styles.medicationDetail}><Text style={styles.label}>Frequency:</Text> {med.frequency}</Text>
                <Text style={styles.medicationDetail}><Text style={styles.label}>Duration:</Text> {med.duration}</Text>
                <Text style={styles.medicationDetail}><Text style={styles.label}>Purpose:</Text> {med.purpose}</Text>
                <Text style={styles.medicationDetail}><Text style={styles.label}>Instructions:</Text> {med.instructions}</Text>
                <Text style={styles.medicationDetail}><Text style={styles.label}>Side Effects:</Text> {med.side_effects}</Text>
                <Text style={styles.medicationDetail}><Text style={styles.label}>Precautions:</Text> {med.precautions}</Text>
              </Surface>
            ))}
          </Card.Content>
        </Card>

        <Card style={styles.card} elevation={4}>
          <LinearGradient colors={["#ff9966", "#ff5e62"]} style={styles.cardHeader}>
            <Text style={styles.cardHeaderText}>General Instructions</Text>
          </LinearGradient>
          <Card.Content>
            <Text style={styles.infoText}>{generalInstructions}</Text>
          </Card.Content>
        </Card>

        <Card style={styles.card} elevation={4}>
          <LinearGradient colors={["#c471f5", "#fa71cd"]} style={styles.cardHeader}>
            <Text style={styles.cardHeaderText}>Additional Info</Text>
          </LinearGradient>
          <Card.Content>
            <Text style={styles.infoText}>{additionalInfo}</Text>
          </Card.Content>
        </Card>

        <Button
          mode="contained"
          onPress={handleSave}
          style={styles.saveButton}
          contentStyle={styles.saveButtonContent}
        >
          Save Prescription
        </Button>
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
}); 