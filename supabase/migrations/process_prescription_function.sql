-- Create process_prescription function to check user's scan quota
CREATE OR REPLACE FUNCTION public.process_prescription(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_id UUID;
  v_scans_remaining INTEGER;
BEGIN
  -- Get the user ID from user_profiles
  v_user_id := (
    SELECT id FROM public.user_profiles 
    WHERE auth_id = user_id
  );
  
  -- If not found, try direct match
  IF v_user_id IS NULL THEN
    v_user_id := user_id;
  END IF;
  
  -- Get current scans
  SELECT scans_remaining INTO v_scans_remaining
  FROM public.user_profiles
  WHERE id = v_user_id;
  
  -- Check if user has scans
  IF v_scans_remaining IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if user has enough scans
  IF v_scans_remaining <= 0 THEN
    RETURN FALSE;
  END IF;
  
  -- User has scans remaining
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 