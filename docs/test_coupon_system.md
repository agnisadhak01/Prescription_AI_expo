# Coupon System Testing Guide

## Prerequisites

Before testing, you need to:

1. **Apply the migration** by copying the contents of `supabase/migrations/create_coupon_system.sql` into your Supabase SQL Editor and executing it
2. **Have a test user account** in your app
3. **Note the user's current scan quota** before testing

## Step 1: Apply the Database Migration

1. Open your Supabase dashboard
2. Go to the SQL Editor
3. Copy the entire contents of `supabase/migrations/create_coupon_system.sql`
4. Paste and execute the SQL
5. Verify no errors occurred

## Step 2: Verify Database Setup

Run these queries in Supabase SQL Editor to confirm the setup:

```sql
-- Check that tables were created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('coupons', 'coupon_redemptions');

-- Check that WELCOME5 coupon exists
SELECT * FROM public.coupons WHERE code = 'WELCOME5';

-- Check that redeem_coupon function exists
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'redeem_coupon';
```

**Expected Results:**
- Both tables should be listed
- WELCOME5 coupon should exist with 5 scan_amount
- redeem_coupon function should be listed

## Step 3: Test Scenarios

### Test 1: Valid Coupon Redemption (WELCOME5)

**Steps:**
1. Open your app and login with a test user
2. Navigate to the Subscription screen
3. Note the current scan count displayed
4. Enter "WELCOME5" in the coupon code field
5. Tap "Apply" button

**Expected Results:**
- ✅ Success message: "Coupon applied! Scans added."
- ✅ Scan quota increases by 5
- ✅ App redirects to home screen
- ✅ Global scan quota updates correctly

**Verify in Database:**
```sql
-- Check user's scan quota was updated
SELECT scans_remaining FROM public.user_profiles 
WHERE auth_id = 'YOUR_TEST_USER_AUTH_ID';

-- Check redemption was recorded
SELECT cr.*, c.code, c.description 
FROM public.coupon_redemptions cr
JOIN public.coupons c ON cr.coupon_id = c.id
WHERE cr.user_id = (
  SELECT id FROM public.user_profiles 
  WHERE auth_id = 'YOUR_TEST_USER_AUTH_ID'
);

-- Check transaction was logged
SELECT * FROM public.scan_quota_transactions 
WHERE transaction_type = 'coupon' 
AND reference_id = 'WELCOME5'
ORDER BY created_at DESC LIMIT 1;
```

### Test 2: Already Used Coupon

**Steps:**
1. With the same user from Test 1
2. Go to Subscription screen again
3. Enter "WELCOME5" again
4. Tap "Apply"

**Expected Results:**
- ❌ Error message: "You have already used this coupon."
- ❌ No change in scan quota
- ❌ No additional database records

### Test 3: Invalid Coupon Code

**Steps:**
1. Enter "INVALID123" in the coupon field
2. Tap "Apply"

**Expected Results:**
- ❌ Error message: "Invalid coupon."
- ❌ No change in scan quota

### Test 4: Case Insensitivity

**Steps:**
1. Use a different test user (or create new one)
2. Enter "welcome5" (lowercase) in the coupon field
3. Tap "Apply"

**Expected Results:**
- ✅ Should work the same as "WELCOME5"
- ✅ Success message and 5 scans added

### Test 5: Empty/Whitespace Input

**Steps:**
1. Enter empty string or just spaces
2. Tap "Apply"

**Expected Results:**
- ❌ Error message: "Please enter a coupon code."

## Step 4: Test Additional Coupon Types (Optional)

Add a test coupon with limitations:

```sql
-- Insert a limited-time, limited-use coupon
INSERT INTO public.coupons (
  code,
  description,
  scan_amount,
  max_redemptions,
  expires_at,
  is_active
) VALUES (
  'TEST10',
  'Test coupon - 10 scans, max 2 uses',
  10,
  2, -- Only 2 total redemptions allowed
  NOW() + INTERVAL '1 hour', -- Expires in 1 hour
  TRUE
);
```

### Test 6: Limited Redemptions

**Steps:**
1. Use TEST10 coupon with first user ✅
2. Use TEST10 coupon with second user ✅
3. Try TEST10 coupon with third user ❌

**Expected Results:**
- First two should succeed
- Third should get "This coupon has reached its maximum redemptions."

### Test 7: Expired Coupon

**Steps:**
1. Wait for TEST10 to expire (or modify expires_at to past date)
2. Try using TEST10

**Expected Results:**
- ❌ Error message: "This coupon has expired."

## Step 5: Performance and Edge Case Tests

### Test 8: Concurrent Redemptions

**Steps:**
1. Try to redeem the same coupon from multiple devices/sessions simultaneously
2. Verify only one succeeds

### Test 9: Database Consistency

**Verify counters are accurate:**
```sql
-- Check that current_redemptions matches actual redemptions
SELECT 
  c.code,
  c.current_redemptions,
  COUNT(cr.id) as actual_redemptions
FROM public.coupons c
LEFT JOIN public.coupon_redemptions cr ON c.id = cr.coupon_id
GROUP BY c.id, c.code, c.current_redemptions;
```

## Step 6: Error Handling Tests

### Test 10: Network Interruption

**Steps:**
1. Start coupon redemption
2. Turn off network mid-process
3. Turn network back on

**Expected Results:**
- Appropriate error handling
- No partial redemptions
- User can retry successfully

### Test 11: Malformed Input

**Steps:**
1. Try SQL injection attempts: `'; DROP TABLE coupons; --`
2. Try very long strings
3. Try special characters

**Expected Results:**
- All should be handled gracefully
- No database errors
- Appropriate error messages

## Step 7: UI/UX Validation

### Test 12: Loading States

**Verify:**
- ✅ Loading spinner shows during redemption
- ✅ Button is disabled during loading
- ✅ Clear feedback messages
- ✅ Proper navigation after success

### Test 13: Accessibility

**Verify:**
- ✅ Screen reader compatibility
- ✅ Proper focus management
- ✅ Good contrast ratios
- ✅ Touch target sizes

## Step 8: Analytics and Monitoring

### Check Coupon Usage Analytics

```sql
-- Get overall coupon statistics
SELECT 
  c.code,
  c.description,
  c.scan_amount,
  c.current_redemptions,
  c.max_redemptions,
  ROUND(
    CASE 
      WHEN c.max_redemptions IS NULL THEN NULL
      ELSE (c.current_redemptions::DECIMAL / c.max_redemptions) * 100
    END, 2
  ) as redemption_percentage
FROM public.coupons c
ORDER BY c.current_redemptions DESC;

-- Get user redemption patterns
SELECT 
  DATE(cr.redeemed_at) as redemption_date,
  COUNT(*) as redemptions_count,
  SUM(c.scan_amount) as total_scans_granted
FROM public.coupon_redemptions cr
JOIN public.coupons c ON cr.coupon_id = c.id
GROUP BY DATE(cr.redeemed_at)
ORDER BY redemption_date DESC;
```

## Troubleshooting Common Issues

### Issue: "Invalid coupon" for WELCOME5

**Possible causes:**
1. Migration not applied correctly
2. Coupon not inserted
3. is_active = FALSE

**Debug:**
```sql
SELECT * FROM public.coupons WHERE UPPER(code) = 'WELCOME5';
```

### Issue: "User not found" error

**Possible causes:**
1. user_profiles table not properly set up
2. Incorrect auth_id mapping

**Debug:**
```sql
SELECT * FROM public.user_profiles WHERE auth_id = auth.uid();
```

### Issue: Scan quota not updating

**Possible causes:**
1. add_scan_quota function not working
2. Frontend not refreshing quota

**Debug:**
```sql
-- Check if quota was added
SELECT * FROM public.scan_quota_transactions 
WHERE transaction_type = 'coupon' 
ORDER BY created_at DESC LIMIT 5;
```

## Test Results Checklist

Mark each test as complete:

- [ ] Database migration applied successfully
- [ ] WELCOME5 coupon redemption works
- [ ] Already used coupon properly rejected
- [ ] Invalid coupon properly rejected
- [ ] Case insensitive coupon codes work
- [ ] Empty input validation works
- [ ] Limited redemption coupons work
- [ ] Expired coupons properly rejected
- [ ] Database consistency maintained
- [ ] Error handling works properly
- [ ] UI loading states work
- [ ] Analytics queries return expected data

## Success Criteria

The coupon system is working correctly if:

1. ✅ All test scenarios pass as expected
2. ✅ Database integrity is maintained
3. ✅ No users can redeem the same coupon twice
4. ✅ Scan quotas update correctly
5. ✅ Error messages are user-friendly
6. ✅ Performance is acceptable
7. ✅ Analytics data is accurate

If any test fails, refer to the troubleshooting section or check the implementation against the specifications in `docs/coupon_system_setup.md`. 