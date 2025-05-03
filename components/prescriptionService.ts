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

// Function to check if prescription already exists
export const checkPrescriptionExists = async (prescription: Prescription): Promise<boolean> => {
  try {
    // Check if a similar prescription exists
    const { data, error } = await supabase
      .from('prescriptions')
      .select(`
        id,
        medications (*)
      `)
      .eq('user_id', prescription.user_id)
      .eq('doctor_name', prescription.doctor_name)
      .eq('patient_name', prescription.patient_name)
      .eq('date', prescription.date)
      .eq('diagnosis', prescription.diagnosis || '')
      .eq('notes', prescription.notes || '');

    if (error) {
      console.error('Error checking prescription:', error);
      return false;
    }

    // If no prescriptions found, it doesn't exist
    if (!data || data.length === 0) {
      return false;
    }

    // If it has very similar medications, consider it a duplicate
    // This is a simple check - comparing medication counts
    const existingPrescriptions = data.filter((p: any) => {
      if (!p.medications || p.medications.length !== prescription.medications.length) {
        return false;
      }
      
      // For simplicity, just check if most medications have the same name
      // A more thorough check would compare each medication's properties
      const matchCount = p.medications.filter((existingMed: any) => {
        return prescription.medications.some(newMed => 
          newMed.name.toLowerCase() === existingMed.name.toLowerCase()
        );
      }).length;
      
      // If 70% or more medications match, consider it a duplicate
      return matchCount >= (prescription.medications.length * 0.7);
    });

    return existingPrescriptions.length > 0;
  } catch (error) {
    console.error('Error in checkPrescriptionExists:', error);
    return false; // On error, allow save (fail safe)
  }
};

export const savePrescription = async (prescription: Prescription) => {
  try {
    // Check if this prescription already exists
    const exists = await checkPrescriptionExists(prescription);
    if (exists) {
      return { 
        success: false, 
        error: 'Duplicate prescription detected. This prescription has already been saved.',
        isDuplicate: true
      };
    }

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

    if (prescriptionError) {
      console.error('Prescription insert error:', prescriptionError);
      throw prescriptionError;
    }

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

    if (medicationsError) {
      console.error('Medications insert error:', medicationsError);
      throw medicationsError;
    }

    // If there's a local image to upload, upload it to storage first
    let filePath = prescription.image_url;
    if (prescription.image_uri) {
      try {
        filePath = await uploadPrescriptionImage(prescription.image_uri, prescriptionData.id);
      } catch (uploadError) {
        console.error('Error uploading image:', uploadError);
        // Continue without image if upload fails
      }
    }

    // If there's an image file path, save it
    if (filePath) {
      const { error: imageError } = await supabase
        .from('prescription_images')
        .insert({
          prescription_id: prescriptionData.id,
          image_url: filePath // This is now the file path, not a public URL
        });

      if (imageError) {
        console.error('Image insert error:', imageError);
        throw imageError;
      }
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