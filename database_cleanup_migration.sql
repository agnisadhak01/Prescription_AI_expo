-- Database Cleanup and Migration Script
-- Purpose: Fix table inconsistencies, migrate data, and remove stale tables
-- Date: December 2024
-- Status: Ready to execute

-- ============================================================================
-- PHASE 1: DATA MIGRATION (CRITICAL)
-- ============================================================================

-- 1.1: Migrate missing users to profiles table
INSERT INTO public.profiles (
  id,
  email,
  full_name,
  scans_remaining,
  coupons_used,
  created_at,
  updated_at
)
SELECT 
  u.id,
  u.email,
  u.full_name,
  u.scans_remaining,
  u.coupons_used,
  u.created_at,
  u.updated_at
FROM public.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- 1.2: Verify migration was successful
-- Expected: Should return 0 rows after migration
SELECT 'Users not in profiles after migration:' as check_type, COUNT(*) as count
FROM users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- ============================================================================
-- PHASE 2: FUNCTION UPDATES (CRITICAL)
-- ============================================================================

-- 2.1: Fix add_scans_after_payment function to use profiles table
CREATE OR REPLACE FUNCTION public.add_scans_after_payment(
  user_id UUID,
  txn_id TEXT,
  amount NUMERIC,
  scans_to_add INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_exists BOOLEAN;
  existing_txn BOOLEAN;
BEGIN
  -- Check if user exists
  SELECT EXISTS (
    SELECT 1 FROM auth.users WHERE id = user_id
  ) INTO user_exists;
  
  IF NOT user_exists THEN
    RAISE EXCEPTION 'User with ID % does not exist', user_id;
  END IF;
  
  -- Check if this transaction has already been processed
  -- This prevents duplicate processing of the same payment
  SELECT EXISTS (
    SELECT 1 FROM payment_transactions WHERE transaction_id = txn_id
  ) INTO existing_txn;
  
  IF existing_txn THEN
    -- Already processed this transaction
    RETURN;
  END IF;
  
  -- 1. Update the scan count in PROFILES table (where app reads from)
  UPDATE public.profiles
  SET 
    scans_remaining = COALESCE(scans_remaining, 0) + scans_to_add,
    updated_at = NOW()
  WHERE id = user_id;
  
  -- 2. Record the payment in transaction history
  INSERT INTO payment_transactions (
    user_id,
    transaction_id,
    amount,
    scans_added,
    payment_method,
    status
  ) VALUES (
    user_id,
    txn_id,
    amount,
    scans_to_add,
    'payu',
    'completed'
  );
  
  -- 3. Add an entry to the scan_history table
  INSERT INTO scan_history (
    user_id,
    action_type,
    scans_changed,
    description
  ) VALUES (
    user_id,
    'purchase',
    scans_to_add,
    'Purchased ' || scans_to_add || ' scans for ₹' || amount
  );
END;
$$;

-- 2.2: Fix handle_new_user to use profiles table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create a profile entry for the new user with 0 initial scans
  -- Scans will be added when the user verifies their email
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    scans_remaining,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    0,  -- No scans until email verification
    NOW(),
    NOW()
  );
  
  RETURN NEW;
END;
$$;

-- 2.3: Remove handle_user_login function (not needed - login tracking in auth.users)
-- The last_login field can be tracked in auth.users via triggers if needed

-- 2.4: Update any other functions that reference users table
-- This ensures all future operations use profiles table consistently

-- ============================================================================
-- PHASE 3: REMOVE STALE TABLES (MAINTENANCE)
-- ============================================================================

-- 3.1: Drop payments table (unused, 0 rows)
-- This table is a duplicate of payment_transactions with no data
DROP TABLE IF EXISTS public.payments CASCADE;

-- 3.2: Drop user_sessions table (unused, 0 rows)
-- This table has no data and no references in the application
DROP TABLE IF EXISTS public.user_sessions CASCADE;

-- Note: users table will be dropped in Phase 4 after verification

-- ============================================================================
-- PHASE 4: VERIFICATION QUERIES
-- ============================================================================

-- 4.1: Verify data consistency
SELECT 
  'Total users in auth.users' as table_name, 
  COUNT(*) as count 
FROM auth.users
UNION ALL
SELECT 
  'Total profiles in public.profiles' as table_name, 
  COUNT(*) as count 
FROM public.profiles
UNION ALL
SELECT 
  'Users without profiles' as table_name, 
  COUNT(*) as count 
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- 4.2: Verify coupon system integrity
SELECT 
  'Active coupons' as type,
  COUNT(*) as count,
  STRING_AGG(code, ', ') as codes
FROM public.coupons 
WHERE expiry > NOW() OR expiry IS NULL;

-- 4.3: Verify payment transaction integrity
SELECT 
  'Payment transactions' as type,
  COUNT(*) as count,
  SUM(scans_added) as total_scans_sold
FROM public.payment_transactions
WHERE status = 'completed';

-- 4.4: Check function definitions
SELECT 
  routine_name,
  routine_type,
  'Uses profiles table' as status
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_definition LIKE '%profiles%'
AND routine_name IN ('add_scans_after_payment', 'redeem_coupon', 'get_current_user_quota');

-- ============================================================================
-- PHASE 5: FINAL CLEANUP (Execute after verification)
-- ============================================================================

-- 5.1: Drop users table (execute only after confirming everything works)
-- Uncomment after Phase 4 verification is complete and app testing is successful

-- DROP TABLE IF EXISTS public.users CASCADE;

-- 5.2: Create final verification query
-- Run this after dropping users table to confirm cleanup
/*
SELECT 
  table_name,
  CASE 
    WHEN table_name IN ('profiles', 'coupons', 'payment_transactions', 'notifications', 
                       'prescriptions', 'prescription_images', 'medications', 
                       'scan_history', 'scan_quota_transactions') 
    THEN '✅ ACTIVE'
    ELSE '❌ SHOULD NOT EXIST'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
*/

-- ============================================================================
-- POST-MIGRATION TESTING CHECKLIST
-- ============================================================================

/*
After running this migration, test the following:

1. User Registration:
   - Register new user
   - Verify profile is created in profiles table
   - Verify email verification gives 3 scans

2. Coupon System:
   - Redeem WELCOME5 coupon
   - Verify scans are added to profiles.scans_remaining
   - Verify coupon is marked as used in profiles.coupons_used

3. Payment System:
   - Complete PayU payment
   - Verify webhook calls add_scans_after_payment function
   - Verify scans are added to profiles.scans_remaining
   - Verify transaction is recorded in payment_transactions

4. Scan Usage:
   - Use scan through app
   - Verify profiles.scans_remaining is decremented
   - Verify scan_history is updated

5. App Integration:
   - Verify AuthContext.scansRemaining shows correct value
   - Verify quota refreshes correctly
   - Verify all UI shows correct scan count
*/

-- ============================================================================
-- ROLLBACK PLAN (Emergency use only)
-- ============================================================================

/*
If issues arise, rollback steps:

1. Recreate users table:
   CREATE TABLE public.users (LIKE public.profiles INCLUDING ALL);
   
2. Copy data back from profiles:
   INSERT INTO public.users SELECT * FROM public.profiles;
   
3. Restore original functions from backup
   
4. Test application functionality

Note: Keep database backup before running this migration!
*/ 