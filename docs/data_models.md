# Data Models Documentation

## Prescription Data Models

### 1. PrescriptionResponse

This is the main data model returned after OCR processing of a prescription image.

```kotlin
@Serializable
data class PrescriptionResponse(
    val id: String,                            // Unique identifier
    val userId: String = "",                   // User who owns the prescription
    val imageUrl: String = "",                 // URL to stored prescription image
    
    // Patient Information
    val patientName: String = "",              // Name of the patient
    val patientAge: String = "",               // Age of the patient
    val patientId: String = "",                // Patient ID/medical record number
    val patientContact: String = "",           // Contact information
    val patientAddress: String = "",           // Address of the patient
    
    // Medical Information
    val diagnosis: String = "",                // Diagnosis information
    
    // Doctor Information
    val doctorName: String = "",               // Name of the doctor
    val doctorQualifications: String = "",     // Doctor's qualifications
    val doctorSpecialization: String = "",     // Doctor's specialization
    val medicalRegistrationNo: String = "",    // Doctor's registration number
    val doctorChambers: String = "",           // Doctor's practice location
    
    // Medications
    val medications: List<Medication> = emptyList(), // List of prescribed medications
    
    // Additional Information
    val createdAt: String = "",                // Timestamp when prescription was processed
    val instructions: String = "",             // General instructions
    val additionalInfo: String = ""            // Any additional information
)
```

### 2. Medication

This model represents an individual medication within a prescription.

```kotlin
@Serializable
data class Medication(
    val medicineName: String,                 // Brand name of the medication
    val genericName: String = "",             // Generic name/compound
    val dosageForm: String = "",              // Tablet, capsule, syrup, etc.
    val strength: String = "",                // Strength of the medication
    val frequency: String = "",               // How often to take (e.g., "3 times a day")
    val duration: String = "",                // How long to take the medication
    val timing: String = "",                  // When to take (e.g., "after meals")
    val purpose: String = "",                 // Why the medication is prescribed
    val manufacturer: String = "",            // Manufacturer of the medication
    val description: String = "",             // Description of the medication
    val sideEffects: String = "",             // Potential side effects
    val precautions: String = "",             // Precautions to take
    val alternatives: List<String> = emptyList() // Alternative medications
)
```

## JSON Structure

When a prescription image is processed by the OCR webhook, it returns a JSON object with the following structure:

```json
{
  "patient_details": {
    "name": "Patient Name",
    "age": 35,
    "patient_id": "PAT123456",
    "contact": "+91 9876543210",
    "address": "123 Main Street, City"
  },
  "doctor_details": {
    "name": "Dr. Doctor Name",
    "specialization": "Cardiologist",
    "license_number": "MED12345",
    "contact": "+91 1234567890",
    "chambers": "ABC Hospital, City",
    "visiting_hours": "Mon-Fri, 9AM-5PM"
  },
  "medications": [
    {
      "brand_name": "Medication A",
      "generic_name": "Generic Compound A",
      "dosage": "10mg",
      "frequency": "3 times a day",
      "duration": "7 days",
      "purpose": "For inflammation",
      "instructions": "Take after meals",
      "side_effects": "May cause drowsiness",
      "precautions": "Avoid alcohol"
    },
    {
      "brand_name": "Medication B",
      "generic_name": "Generic Compound B",
      "dosage": "500mg",
      "frequency": "Twice daily",
      "duration": "10 days",
      "purpose": "For infection",
      "instructions": "Take with water",
      "side_effects": "May cause nausea",
      "precautions": "Take complete course"
    }
  ],
  "general_instructions": "Rest well and drink plenty of fluids. Follow up after 10 days.",
  "additional_info": "Medical tests recommended: Blood test, ECG"
}
```

## Data Flow

1. **Image Capture**: User captures a prescription image via camera or selects from gallery
2. **Image Upload**: Image is sent to the OCR webhook endpoint
3. **OCR Processing**: The webhook service extracts text and structures it into the JSON format
4. **Data Parsing**: The app parses the JSON response into the `PrescriptionResponse` model
5. **Storage**: The processed data is stored in the Supabase database
6. **Display**: The structured data is displayed to the user in a readable format

## Alternative Data Structures

If the OCR service fails or returns incomplete data, the app generates a simplified `PrescriptionResponse` with:
- A generated UUID
- An error message in the instructions field

## Data Validation

The app performs the following validations on the processed data:
1. Checking for required fields (medication names, dosages)
2. Validating date formats
3. Ensuring consistency between related fields
4. Normalizing text case and formatting

## Best Practices

1. **Error Handling**: Always check for null or empty fields before displaying
2. **Data Processing**: Format dates and times in user-friendly formats
3. **Sensitive Data**: Avoid displaying sensitive patient information unnecessarily
4. **Versioning**: Include version information in stored data for future compatibility
5. **Caching**: Implement proper caching to reduce processing needs 