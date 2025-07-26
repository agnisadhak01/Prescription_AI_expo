-- Create a storage bucket for prescription images if it doesn't exist
-- Note: You may need to create this through the Supabase dashboard UI

-- Set up storage RLS policies
BEGIN;
  -- Enable RLS for storage
  ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Users can view their own prescription images" ON storage.objects;
  DROP POLICY IF EXISTS "Users can upload their own prescription images" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update their own prescription images" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete their own prescription images" ON storage.objects;

  -- Allow users to view their own files
  -- This policy checks if the authenticated user owns the prescription associated with the image
  CREATE POLICY "Users can view their own prescription images"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'prescription-images' AND (
      auth.uid() IN (
        SELECT user_id FROM prescriptions 
        WHERE id::text = (storage.foldername(name))[1]
      )
    )
  );

  -- Allow users to upload their own files
  -- This policy allows users to upload images only for their own prescriptions
  CREATE POLICY "Users can upload their own prescription images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'prescription-images' AND (
      auth.uid() IN (
        SELECT user_id FROM prescriptions 
        WHERE id::text = (storage.foldername(name))[1]
      )
    )
  );

  -- Allow users to update their own files
  -- This policy allows users to update images only for their own prescriptions
  CREATE POLICY "Users can update their own prescription images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'prescription-images' AND (
      auth.uid() IN (
        SELECT user_id FROM prescriptions 
        WHERE id::text = (storage.foldername(name))[1]
      )
    )
  );

  -- Allow users to delete their own files
  -- This policy allows users to delete images only for their own prescriptions
  CREATE POLICY "Users can delete their own prescription images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'prescription-images' AND (
      auth.uid() IN (
        SELECT user_id FROM prescriptions 
        WHERE id::text = (storage.foldername(name))[1]
      )
    )
  );

  -- Public access policy (optional - if you want to allow public access to some images)
  -- CREATE POLICY "Public Access Policy"
  -- ON storage.objects FOR SELECT
  -- USING (
  --   bucket_id = 'prescription-images' AND 
  --   storage.extension(name) IN ('jpg', 'jpeg', 'png', 'gif') AND
  --   name LIKE 'public/%'
  -- );
COMMIT;

-- Create a function to handle prescription image uploads
CREATE OR REPLACE FUNCTION handle_new_prescription_image()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure the prescription belongs to the authenticated user
  IF NOT EXISTS (
    SELECT 1 FROM prescriptions 
    WHERE id = NEW.prescription_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'You can only add images to your own prescriptions';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to validate prescription image uploads
DROP TRIGGER IF EXISTS validate_prescription_image_ownership ON prescription_images;
CREATE TRIGGER validate_prescription_image_ownership
  BEFORE INSERT ON prescription_images
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_prescription_image(); 