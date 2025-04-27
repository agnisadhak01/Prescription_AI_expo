import { supabase } from './supabaseClient';
import { uploadPrescriptionImage } from './storageService';

export interface Prescription {
  id?: string;
  user_id: string;
  doctor_name: string;
  patient_name: string;
  date: string;
  diagnosis?: string;
  notes?: string;
  medications: Medication[];
  image_url?: string;
  image_uri?: string; // Local URI for new image uploads
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export const savePrescription = async (prescription: Prescription) => {
  try {
    // First, save the prescription
    const { data: prescriptionData, error: prescriptionError } = await supabase
      .from('prescriptions')
      .insert({
        user_id: prescription.user_id,
        doctor_name: prescription.doctor_name,
        patient_name: prescription.patient_name,
        date: prescription.date,
        diagnosis: prescription.diagnosis,
        notes: prescription.notes
      })
      .select()
      .single();

    if (prescriptionError) throw prescriptionError;

    // Then save the medications
    const medicationsToInsert = prescription.medications.map(med => ({
      prescription_id: prescriptionData.id,
      name: med.name,
      dosage: med.dosage,
      frequency: med.frequency,
      duration: med.duration,
      instructions: med.instructions
    }));

    const { error: medicationsError } = await supabase
      .from('medications')
      .insert(medicationsToInsert);

    if (medicationsError) throw medicationsError;

    // If there's a local image to upload, upload it to storage first
    let imageUrl = prescription.image_url;
    if (prescription.image_uri) {
      try {
        imageUrl = await uploadPrescriptionImage(prescription.image_uri, prescriptionData.id);
      } catch (uploadError) {
        console.error('Error uploading image:', uploadError);
        // Continue without image if upload fails
      }
    }

    // If there's an image URL, save it
    if (imageUrl) {
      const { error: imageError } = await supabase
        .from('prescription_images')
        .insert({
          prescription_id: prescriptionData.id,
          image_url: imageUrl
        });

      if (imageError) throw imageError;
    }

    return { success: true, data: prescriptionData };
  } catch (error) {
    console.error('Error saving prescription:', error);
    return { success: false, error };
  }
};

export const getPrescriptions = async (userId: string) => {
  try {
    const { data: prescriptions, error } = await supabase
      .from('prescriptions')
      .select(`
        *,
        medications (*),
        prescription_images (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data: prescriptions };
  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    return { success: false, error };
  }
};

export const deletePrescription = async (prescriptionId: string) => {
  try {
    // Delete prescription (cascades to medications and images)
    const { error } = await supabase
      .from('prescriptions')
      .delete()
      .eq('id', prescriptionId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error deleting prescription:', error);
    return { success: false, error };
  }
}; 