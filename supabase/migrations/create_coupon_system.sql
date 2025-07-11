-- Migration: create_coupon_system.sql
-- Creates the coupon system for welcome benefits and other promotional offers

-- Create coupons table
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  scan_amount INTEGER NOT NULL DEFAULT 0,
  max_redemptions INTEGER DEFAULT NULL, -- NULL means unlimited
  current_redemptions INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ DEFAULT NULL, -- NULL means no expiry
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create coupon redemptions table to track who used which coupons
CREATE TABLE IF NOT EXISTS public.coupon_redemptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  redeemed_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure a user can only redeem a specific coupon once
  UNIQUE(coupon_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active_expires ON public.coupons(is_active, expires_at);
CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_user_id ON public.coupon_redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_coupon_id ON public.coupon_redemptions(coupon_id);

-- Create function to redeem a coupon
CREATE OR REPLACE FUNCTION public.redeem_coupon(
  user_id_param UUID,
  coupon_code TEXT
) RETURNS TEXT AS $$
DECLARE
  v_coupon_record RECORD;
  v_user_profile_id UUID;
  v_already_used BOOLEAN;
BEGIN
  -- Get user profile ID from auth user ID
  SELECT id INTO v_user_profile_id
  FROM public.user_profiles
  WHERE auth_id = user_id_param;
  
  -- If no profile found, try direct user ID match
  IF v_user_profile_id IS NULL THEN
    v_user_profile_id := user_id_param;
  END IF;
  
  -- Validate that user profile exists
  IF NOT EXISTS (SELECT 1 FROM public.user_profiles WHERE id = v_user_profile_id) THEN
    RETURN 'user_not_found';
  END IF;
  
  -- Get coupon details
  SELECT * INTO v_coupon_record
  FROM public.coupons
  WHERE UPPER(code) = UPPER(coupon_code) AND is_active = TRUE;
  
  -- Check if coupon exists and is active
  IF NOT FOUND THEN
    RETURN 'invalid_coupon';
  END IF;
  
  -- Check if coupon has expired
  IF v_coupon_record.expires_at IS NOT NULL AND v_coupon_record.expires_at < NOW() THEN
    RETURN 'expired_coupon';
  END IF;
  
  -- Check if maximum redemptions reached
  IF v_coupon_record.max_redemptions IS NOT NULL AND 
     v_coupon_record.current_redemptions >= v_coupon_record.max_redemptions THEN
    RETURN 'max_redemptions_reached';
  END IF;
  
  -- Check if user has already used this coupon
  SELECT EXISTS(
    SELECT 1 FROM public.coupon_redemptions
    WHERE coupon_id = v_coupon_record.id AND user_id = v_user_profile_id
  ) INTO v_already_used;
  
  IF v_already_used THEN
    RETURN 'already_used';
  END IF;
  
  -- All validations passed, redeem the coupon
  BEGIN
    -- Add scan quota to user using existing function
    PERFORM public.add_scan_quota(
      v_user_profile_id,
      v_coupon_record.scan_amount,
      'coupon'::scan_transaction_type,
      v_coupon_record.code
    );
    
    -- Record the redemption
    INSERT INTO public.coupon_redemptions (coupon_id, user_id)
    VALUES (v_coupon_record.id, v_user_profile_id);
    
    -- Update coupon redemption count
    UPDATE public.coupons
    SET 
      current_redemptions = current_redemptions + 1,
      updated_at = NOW()
    WHERE id = v_coupon_record.id;
    
    RETURN 'success';
  EXCEPTION
    WHEN OTHERS THEN
      RAISE EXCEPTION 'Error redeeming coupon: %', SQLERRM;
      RETURN 'error';
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on coupon tables
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_redemptions ENABLE ROW LEVEL SECURITY;

-- RLS policies for coupons table (read-only for authenticated users)
CREATE POLICY "Users can view active coupons"
  ON public.coupons FOR SELECT
  USING (auth.uid() IS NOT NULL AND is_active = TRUE);

-- RLS policies for coupon_redemptions table (users can only see their own redemptions)
CREATE POLICY "Users can view their own coupon redemptions"
  ON public.coupon_redemptions FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND
    user_id = (
      SELECT id FROM public.user_profiles 
      WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own coupon redemptions"
  ON public.coupon_redemptions FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    user_id = (
      SELECT id FROM public.user_profiles 
      WHERE auth_id = auth.uid()
    )
  );

-- Insert WELCOME5 coupon for all new users
INSERT INTO public.coupons (
  code,
  description,
  scan_amount,
  max_redemptions,
  expires_at,
  is_active
) VALUES (
  'WELCOME5',
  'Welcome bonus - 5 free scans for new users',
  5,
  NULL, -- Unlimited redemptions
  NULL, -- No expiry date
  TRUE
) ON CONFLICT (code) DO NOTHING;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_coupon_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_coupons_updated_at ON public.coupons;
CREATE TRIGGER update_coupons_updated_at
  BEFORE UPDATE ON public.coupons
  FOR EACH ROW
  EXECUTE FUNCTION public.update_coupon_updated_at(); 