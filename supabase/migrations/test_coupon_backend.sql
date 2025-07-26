-- Quick Backend Test Script for Coupon System
-- Run this in Supabase SQL Editor after applying the migration

-- ============================================
-- SETUP: Create a test user profile if needed
-- ============================================

-- First, let's create a test user profile for testing
-- Replace this UUID with an actual auth.users ID from your system
DO $$
DECLARE
    test_auth_id UUID := 'test-user-12345678-1234-1234-1234-123456789012'; -- Replace with real auth ID
    test_profile_id UUID;
BEGIN
    -- Insert test user profile if it doesn't exist
    INSERT INTO public.user_profiles (auth_id, email, scans_remaining, total_scans_purchased)
    VALUES (test_auth_id, 'test@example.com', 0, 0)
    ON CONFLICT (auth_id) DO NOTHING;
    
    -- Get the profile ID for testing
    SELECT id INTO test_profile_id FROM public.user_profiles WHERE auth_id = test_auth_id;
    
    RAISE NOTICE 'Test user profile ID: %', test_profile_id;
END $$;

-- ============================================
-- TEST 1: Verify WELCOME5 Coupon Exists
-- ============================================

SELECT 
    'TEST 1: WELCOME5 Coupon Check' as test_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM public.coupons WHERE code = 'WELCOME5' AND is_active = TRUE)
        THEN '✅ PASS - WELCOME5 coupon exists and is active'
        ELSE '❌ FAIL - WELCOME5 coupon not found or inactive'
    END as result;

-- Show coupon details
SELECT 'WELCOME5 Coupon Details:' as info, * FROM public.coupons WHERE code = 'WELCOME5';

-- ============================================
-- TEST 2: Test Valid Coupon Redemption
-- ============================================

-- Test redeeming WELCOME5 coupon
SELECT 
    'TEST 2: Valid Coupon Redemption' as test_name,
    public.redeem_coupon(
        'test-user-12345678-1234-1234-1234-123456789012'::UUID, -- Replace with real auth ID
        'WELCOME5'
    ) as result;

-- Check if scan quota was updated
SELECT 
    'Scan Quota After Redemption:' as info,
    scans_remaining,
    total_scans_purchased
FROM public.user_profiles 
WHERE auth_id = 'test-user-12345678-1234-1234-1234-123456789012'::UUID; -- Replace with real auth ID

-- ============================================
-- TEST 3: Test Already Used Coupon
-- ============================================

-- Try to redeem the same coupon again
SELECT 
    'TEST 3: Already Used Coupon' as test_name,
    public.redeem_coupon(
        'test-user-12345678-1234-1234-1234-123456789012'::UUID, -- Replace with real auth ID
        'WELCOME5'
    ) as result,
    CASE 
        WHEN public.redeem_coupon('test-user-12345678-1234-1234-1234-123456789012'::UUID, 'WELCOME5') = 'already_used'
        THEN '✅ PASS - Correctly rejected already used coupon'
        ELSE '❌ FAIL - Should have rejected already used coupon'
    END as validation;

-- ============================================
-- TEST 4: Test Invalid Coupon
-- ============================================

SELECT 
    'TEST 4: Invalid Coupon' as test_name,
    public.redeem_coupon(
        'test-user-12345678-1234-1234-1234-123456789012'::UUID, -- Replace with real auth ID
        'INVALID123'
    ) as result,
    CASE 
        WHEN public.redeem_coupon('test-user-12345678-1234-1234-1234-123456789012'::UUID, 'INVALID123') = 'invalid_coupon'
        THEN '✅ PASS - Correctly rejected invalid coupon'
        ELSE '❌ FAIL - Should have rejected invalid coupon'
    END as validation;

-- ============================================
-- TEST 5: Test Case Insensitivity
-- ============================================

-- Create another test user for case sensitivity test
DO $$
DECLARE
    test_auth_id2 UUID := 'test-user2-12345678-1234-1234-1234-123456789012'; -- Replace with real auth ID
BEGIN
    INSERT INTO public.user_profiles (auth_id, email, scans_remaining, total_scans_purchased)
    VALUES (test_auth_id2, 'test2@example.com', 0, 0)
    ON CONFLICT (auth_id) DO NOTHING;
END $$;

-- Test lowercase coupon code
SELECT 
    'TEST 5: Case Insensitivity' as test_name,
    public.redeem_coupon(
        'test-user2-12345678-1234-1234-1234-123456789012'::UUID, -- Replace with real auth ID
        'welcome5'  -- lowercase
    ) as result,
    CASE 
        WHEN public.redeem_coupon('test-user2-12345678-1234-1234-1234-123456789012'::UUID, 'welcome5') = 'success'
        THEN '✅ PASS - Case insensitive coupon codes work'
        ELSE '❌ FAIL - Case insensitive coupon codes should work'
    END as validation;

-- ============================================
-- TEST 6: Test Limited Redemption Coupon
-- ============================================

-- Create a test coupon with limited redemptions
INSERT INTO public.coupons (
    code,
    description,
    scan_amount,
    max_redemptions,
    is_active
) VALUES (
    'TESTLIMIT',
    'Test limited coupon - 3 scans, max 1 use',
    3,
    1, -- Only 1 total redemption allowed
    TRUE
) ON CONFLICT (code) DO NOTHING;

-- Test the limited coupon with first user
SELECT 
    'TEST 6A: Limited Coupon - First Use' as test_name,
    public.redeem_coupon(
        'test-user-12345678-1234-1234-1234-123456789012'::UUID, -- Replace with real auth ID
        'TESTLIMIT'
    ) as result;

-- Test the limited coupon with second user (should fail)
SELECT 
    'TEST 6B: Limited Coupon - Second Use' as test_name,
    public.redeem_coupon(
        'test-user2-12345678-1234-1234-1234-123456789012'::UUID, -- Replace with real auth ID
        'TESTLIMIT'
    ) as result,
    CASE 
        WHEN public.redeem_coupon('test-user2-12345678-1234-1234-1234-123456789012'::UUID, 'TESTLIMIT') = 'max_redemptions_reached'
        THEN '✅ PASS - Correctly enforced max redemptions'
        ELSE '❌ FAIL - Should have enforced max redemptions'
    END as validation;

-- ============================================
-- TEST 7: Test Expired Coupon
-- ============================================

-- Create an expired test coupon
INSERT INTO public.coupons (
    code,
    description,
    scan_amount,
    expires_at,
    is_active
) VALUES (
    'EXPIRED',
    'Test expired coupon',
    5,
    NOW() - INTERVAL '1 day', -- Expired yesterday
    TRUE
) ON CONFLICT (code) DO NOTHING;

-- Test the expired coupon
SELECT 
    'TEST 7: Expired Coupon' as test_name,
    public.redeem_coupon(
        'test-user-12345678-1234-1234-1234-123456789012'::UUID, -- Replace with real auth ID
        'EXPIRED'
    ) as result,
    CASE 
        WHEN public.redeem_coupon('test-user-12345678-1234-1234-1234-123456789012'::UUID, 'EXPIRED') = 'expired_coupon'
        THEN '✅ PASS - Correctly rejected expired coupon'
        ELSE '❌ FAIL - Should have rejected expired coupon'
    END as validation;

-- ============================================
-- VERIFICATION: Check Database Consistency
-- ============================================

-- Check coupon redemption counts
SELECT 
    'Coupon Redemption Summary:' as info,
    c.code,
    c.description,
    c.current_redemptions,
    c.max_redemptions,
    COUNT(cr.id) as actual_redemptions,
    CASE 
        WHEN c.current_redemptions = COUNT(cr.id) 
        THEN '✅ Consistent' 
        ELSE '❌ Inconsistent' 
    END as consistency_check
FROM public.coupons c
LEFT JOIN public.coupon_redemptions cr ON c.id = cr.coupon_id
GROUP BY c.id, c.code, c.description, c.current_redemptions, c.max_redemptions
ORDER BY c.code;

-- Check transaction records
SELECT 
    'Transaction Records:' as info,
    COUNT(*) as total_coupon_transactions,
    SUM(amount) as total_scans_granted
FROM public.scan_quota_transactions 
WHERE transaction_type = 'coupon';

-- Show recent coupon redemptions
SELECT 
    'Recent Redemptions:' as info,
    cr.redeemed_at,
    c.code,
    c.scan_amount,
    up.email
FROM public.coupon_redemptions cr
JOIN public.coupons c ON cr.coupon_id = c.id
JOIN public.user_profiles up ON cr.user_id = up.id
ORDER BY cr.redeemed_at DESC
LIMIT 10;

-- ============================================
-- CLEANUP (Optional)
-- ============================================

-- Uncomment the following to clean up test data:

/*
-- Remove test user profiles
DELETE FROM public.user_profiles 
WHERE auth_id IN (
    'test-user-12345678-1234-1234-1234-123456789012',
    'test-user2-12345678-1234-1234-1234-123456789012'
);

-- Remove test coupons (but keep WELCOME5)
DELETE FROM public.coupons 
WHERE code IN ('TESTLIMIT', 'EXPIRED');
*/

-- ============================================
-- SUMMARY
-- ============================================

SELECT '🎉 TESTING COMPLETE' as summary, 
       'Check the results above to verify all tests passed' as next_steps; 