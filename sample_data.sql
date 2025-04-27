-- NOTE: Before running this script, replace 'USER_ID_HERE' with an actual user ID from your auth.users table
-- You can get this from the Supabase dashboard after creating a user account

-- Sample user data (if your user ID isn't in the users table yet)
-- This assumes you've already created a user through Supabase Auth
-- INSERT INTO users (id, email, full_name)
-- VALUES ('d4afd0fc-4f63-494d-8b68-234485439c23', 'user@example.com', 'Test User');

-- Sample prescription data
DO $$
DECLARE
    user_id UUID := 'd4afd0fc-4f63-494d-8b68-234485439c23'::UUID; -- Provided user ID
    p1_id UUID;
    p2_id UUID;
    p3_id UUID;
BEGIN
    -- First prescription
    INSERT INTO prescriptions (id, user_id, doctor_name, patient_name, date, diagnosis, notes)
    VALUES (
        uuid_generate_v4(),
        user_id,
        'Dr. Amit Sharma',
        'Rahul Kumar',
        '2024-05-10',
        'Seasonal Flu with Mild Cough',
        'Patient should rest and avoid cold foods'
    )
    RETURNING id INTO p1_id;

    -- Medications for first prescription
    INSERT INTO medications (prescription_id, name, dosage, frequency, duration, instructions)
    VALUES
    (p1_id, 'Paracetamol', '500mg', 'Twice daily', '5 days', 'Take after meals'),
    (p1_id, 'Cetirizine', '10mg', 'Once daily', '3 days', 'Take at night before sleep'),
    (p1_id, 'Amoxicillin', '250mg', 'Three times daily', '7 days', 'Take with water');
    
    -- Image for first prescription
    INSERT INTO prescription_images (prescription_id, image_url)
    VALUES
    (p1_id, 'https://fwvwxzvynfrqjvizcejf.supabase.co/storage/v1/object/public/prescription-images/sample_prescription_1.jpg');

    -- Second prescription
    INSERT INTO prescriptions (id, user_id, doctor_name, patient_name, date, diagnosis, notes)
    VALUES (
        uuid_generate_v4(),
        user_id,
        'Dr. Priya Patel',
        'Rahul Kumar',
        '2024-04-15',
        'Migraine',
        'Patient reporting recurring headaches'
    )
    RETURNING id INTO p2_id;

    -- Medications for second prescription
    INSERT INTO medications (prescription_id, name, dosage, frequency, duration, instructions)
    VALUES
    (p2_id, 'Rizatriptan', '10mg', 'As needed', 'Not more than 2 tablets per day', 'Take at onset of migraine'),
    (p2_id, 'Propranolol', '40mg', 'Twice daily', '30 days', 'Take regularly even if no headache');
    
    -- Image for second prescription
    INSERT INTO prescription_images (prescription_id, image_url)
    VALUES
    (p2_id, 'https://fwvwxzvynfrqjvizcejf.supabase.co/storage/v1/object/public/prescription-images/sample_prescription_2.jpg');

    -- Third prescription
    INSERT INTO prescriptions (id, user_id, doctor_name, patient_name, date, diagnosis, notes)
    VALUES (
        uuid_generate_v4(),
        user_id,
        'Dr. Sanjay Gupta',
        'Rahul Kumar',
        '2024-03-05',
        'Hypertension',
        'Regular checkup, blood pressure slightly elevated'
    )
    RETURNING id INTO p3_id;

    -- Medications for third prescription
    INSERT INTO medications (prescription_id, name, dosage, frequency, duration, instructions)
    VALUES
    (p3_id, 'Amlodipine', '5mg', 'Once daily', '90 days', 'Take in the morning'),
    (p3_id, 'Hydrochlorothiazide', '12.5mg', 'Once daily', '90 days', 'Take in the morning with amlodipine'),
    (p3_id, 'Aspirin', '75mg', 'Once daily', '90 days', 'Take with food');
    
    -- Image for third prescription
    INSERT INTO prescription_images (prescription_id, image_url)
    VALUES
    (p3_id, 'https://fwvwxzvynfrqjvizcejf.supabase.co/storage/v1/object/public/prescription-images/sample_prescription_3.jpg');
END $$; 