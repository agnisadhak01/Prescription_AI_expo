-- Migration: create_quota_tables.sql
-- Creates the necessary database structure for quota management

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Ensure user_profiles table exists and has required columns
DO $$ 
BEGIN
  -- Check if user_profiles table exists
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_profiles') THEN
    -- Add scans_remaining column if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'user_profiles' 
                  AND column_name = 'scans_remaining') THEN
      ALTER TABLE public.user_profiles ADD COLUMN scans_remaining INTEGER DEFAULT 0;
    END IF;
    
    -- Add total_scans_purchased column if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'user_profiles' 
                  AND column_name = 'total_scans_purchased') THEN
      ALTER TABLE public.user_profiles ADD COLUMN total_scans_purchased INTEGER DEFAULT 0;
    END IF;
  ELSE
    -- Create user_profiles table if it doesn't exist
    CREATE TABLE public.user_profiles (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      email TEXT UNIQUE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      scans_remaining INTEGER DEFAULT 0,
      total_scans_purchased INTEGER DEFAULT 0
    );
  END IF;
END $$;

-- Create enum type for transaction types
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'scan_transaction_type') THEN
    CREATE TYPE scan_transaction_type AS ENUM ('purchase', 'usage', 'refund', 'coupon', 'admin');
  END IF;
END $$;

-- Create scan quota transactions table
CREATE TABLE IF NOT EXISTS public.scan_quota_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- Can be positive (add) or negative (deduct)
  description TEXT,
  transaction_type scan_transaction_type NOT NULL,
  reference_id TEXT, -- For payment/coupon references
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create function to add scan quota
CREATE OR REPLACE FUNCTION public.add_scan_quota(
  p_user_id UUID,
  p_amount INTEGER,
  p_type scan_transaction_type,
  p_reference TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  v_description TEXT;
  v_user_exists BOOLEAN;
BEGIN
  -- Validate inputs
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive when adding quota';
  END IF;
  
  -- Verify user exists
  SELECT EXISTS(SELECT 1 FROM public.user_profiles WHERE id = p_user_id) INTO v_user_exists;
  IF NOT v_user_exists THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  -- Set description based on transaction type
  CASE p_type
    WHEN 'purchase' THEN v_description := 'Purchase of ' || p_amount || ' scans';
    WHEN 'coupon' THEN v_description := 'Coupon redemption for ' || p_amount || ' scans';
    WHEN 'admin' THEN v_description := 'Admin added ' || p_amount || ' scans';
    WHEN 'refund' THEN v_description := 'Refund of ' || p_amount || ' scans';
    ELSE v_description := 'Added ' || p_amount || ' scans';
  END CASE;
  
  -- Start transaction
  BEGIN
    -- Update user's scan quota
    UPDATE public.user_profiles
    SET 
      scans_remaining = scans_remaining + p_amount,
      total_scans_purchased = CASE 
                               WHEN p_type = 'purchase' THEN total_scans_purchased + p_amount
                               ELSE total_scans_purchased
                              END,
      updated_at = NOW()
    WHERE id = p_user_id;
    
    -- Record the transaction
    INSERT INTO public.scan_quota_transactions (
      user_id,
      amount,
      description,
      transaction_type,
      reference_id
    ) VALUES (
      p_user_id,
      p_amount,
      v_description,
      p_type,
      p_reference
    );
    
    RETURN TRUE;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE EXCEPTION 'Error adding scan quota: %', SQLERRM;
      RETURN FALSE;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to use a scan
CREATE OR REPLACE FUNCTION public.use_scan_quota(
  p_user_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_scans_remaining INTEGER;
BEGIN
  -- Get current scans
  SELECT scans_remaining INTO v_scans_remaining
  FROM public.user_profiles
  WHERE id = p_user_id;
  
  -- Check if user has scans
  IF v_scans_remaining IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  -- Check if user has enough scans
  IF v_scans_remaining <= 0 THEN
    RAISE EXCEPTION 'No scans remaining';
  END IF;
  
  -- Start transaction
  BEGIN
    -- Deduct scan
    UPDATE public.user_profiles
    SET 
      scans_remaining = scans_remaining - 1,
      updated_at = NOW()
    WHERE id = p_user_id;
    
    -- Record the transaction
    INSERT INTO public.scan_quota_transactions (
      user_id,
      amount,
      description,
      transaction_type
    ) VALUES (
      p_user_id,
      -1,
      'Used 1 scan',
      'usage'
    );
    
    RETURN TRUE;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE EXCEPTION 'Error using scan: %', SQLERRM;
      RETURN FALSE;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create RPC function to get current user's quota
CREATE OR REPLACE FUNCTION public.get_current_user_quota()
RETURNS INTEGER AS $$
DECLARE
  v_user_id UUID;
  v_scans_remaining INTEGER;
BEGIN
  -- Get the current user ID from auth.uid()
  v_user_id := (
    SELECT id FROM public.user_profiles 
    WHERE auth_id = auth.uid()
  );
  
  -- Get current scans
  SELECT scans_remaining INTO v_scans_remaining
  FROM public.user_profiles
  WHERE id = v_user_id;
  
  RETURN COALESCE(v_scans_remaining, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 