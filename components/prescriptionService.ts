import { supabase } from './supabaseClient';

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

    // If there's an image URL, save it
    if (prescription.image_url) {
      const { error: imageError } = await supabase
        .from('prescription_images')
        .insert({
          prescription_id: prescriptionData.id,
          image_url: prescription.image_url
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