# Coupon System Setup Guide

## Overview

This guide explains how to set up and use the coupon system for your Prescription AI app, including the "WELCOME5" coupon that provides 5 free scans to users.

## Database Migration

### Step 1: Apply the Migration

Run the following SQL in your Supabase SQL Editor to create the coupon system:

```sql
-- Copy and paste the entire content of supabase/migrations/create_coupon_system.sql
-- into the Supabase SQL Editor and execute it
```

Or execute the migration file directly:

```bash
# If using Supabase CLI
supabase db push

# Or apply the specific migration
psql -d your_database_url -f supabase/migrations/create_coupon_system.sql
```

### Step 2: Verify the Tables

After running the migration, verify that the following tables were created:

1. **`public.coupons`** - Stores available coupons
2. **`public.coupon_redemptions`** - Tracks which users have used which coupons

### Step 3: Verify the Function

Ensure the `redeem_coupon` function was created:

```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'redeem_coupon';
```

### Step 4: Verify WELCOME5 Coupon

Check that the WELCOME5 coupon was inserted:

```sql
SELECT * FROM public.coupons WHERE code = 'WELCOME5';
```

## Frontend Integration

### Existing Implementation

The coupon system is already integrated into the frontend:

1. **SubscriptionScreen.tsx** - Contains the coupon input form and redemption logic
2. **useAuth.tsx** - Provides `refreshScansRemaining()` function to update quota after redemption

### How It Works

1. User enters coupon code (e.g., "WELCOME5") in the subscription screen
2. App calls `supabase.rpc('redeem_coupon', { user_id, coupon_code })`
3. Backend validates the coupon and adds scans to user's quota
4. Frontend refreshes the scan quota display
5. User receives success/error feedback

## Testing the Coupon System

### Test Scenario 1: Valid Coupon Redemption

1. **Login** as a test user
2. **Navigate** to the Subscription screen
3. **Enter** "WELCOME5" in the coupon code field
4. **Tap** "Apply" button
5. **Expected Result**: 
   - Success message: "Coupon applied! Scans added."
   - Scan quota increases by 5
   - User is redirected to home screen

### Test Scenario 2: Already Used Coupon

1. **Repeat** Test Scenario 1 with the same user
2. **Expected Result**: Error message "You have already used this coupon."

### Test Scenario 3: Invalid Coupon

1. **Enter** "INVALID123" as coupon code
2. **Expected Result**: Error message "Invalid coupon."

### Test Scenario 4: Database Verification

After successful redemption, verify in the database:

```sql
-- Check user's scan quota was updated
SELECT scans_remaining FROM public.user_profiles 
WHERE auth_id = 'your_test_user_id';

-- Check redemption was recorded
SELECT * FROM public.coupon_redemptions 
WHERE user_id = (
  SELECT id FROM public.user_profiles 
  WHERE auth_id = 'your_test_user_id'
);

-- Check coupon redemption count was updated
SELECT current_redemptions FROM public.coupons 
WHERE code = 'WELCOME5';
```

## Coupon System Features

### Security Features

1. **Row Level Security (RLS)** - Users can only see their own redemptions
2. **One-time Use** - Each user can only redeem a specific coupon once
3. **Validation** - Comprehensive validation for expired/invalid coupons
4. **Audit Trail** - All redemptions are tracked in the database

### Business Logic

1. **Case Insensitive** - Coupon codes work regardless of case
2. **Unlimited Redemptions** - WELCOME5 can be used by all users
3. **No Expiry** - WELCOME5 never expires
4. **Scan Quota Integration** - Uses existing `add_scan_quota` function
5. **Transaction Tracking** - Creates audit trail in `scan_quota_transactions`

## Adding New Coupons

### Example: Create a Limited-Time Coupon

```sql
INSERT INTO public.coupons (
  code,
  description,
  scan_amount,
  max_redemptions,
  expires_at,
  is_active
) VALUES (
  'HOLIDAY20',
  'Holiday special - 20 free scans',
  20,
  1000, -- Limited to 1000 total redemptions
  '2024-12-31 23:59:59+00', -- Expires end of year
  TRUE
);
```

### Example: Create a User-Specific Coupon

```sql
-- First create the coupon
INSERT INTO public.coupons (
  code,
  description,
  scan_amount,
  max_redemptions,
  is_active
) VALUES (
  'VIP50',
  'VIP user bonus - 50 scans',
  50,
  1, -- Only one redemption allowed
  TRUE
);

-- Then you can manually track which specific users should have access
-- Or extend the system to support user-specific coupons
```

## Error Handling

The `redeem_coupon` function returns the following possible values:

- `'success'` - Coupon redeemed successfully
- `'invalid_coupon'` - Coupon code doesn't exist or is inactive
- `'expired_coupon'` - Coupon has passed its expiry date
- `'max_redemptions_reached'` - Coupon has reached its maximum usage limit
- `'already_used'` - User has already redeemed this coupon
- `'user_not_found'` - User profile not found
- `'error'` - Generic error during redemption

The frontend handles all these cases and shows appropriate user messages.

## Monitoring and Analytics

### Coupon Usage Reports

```sql
-- Get redemption stats for all coupons
SELECT 
  c.code,
  c.description,
  c.current_redemptions,
  c.max_redemptions,
  COUNT(cr.id) as actual_redemptions
FROM public.coupons c
LEFT JOIN public.coupon_redemptions cr ON c.id = cr.coupon_id
GROUP BY c.id, c.code, c.description, c.current_redemptions, c.max_redemptions;
```

### User Redemption History

```sql
-- Get all coupon redemptions for a specific user
SELECT 
  c.code,
  c.description,
  c.scan_amount,
  cr.redeemed_at
FROM public.coupon_redemptions cr
JOIN public.coupons c ON cr.coupon_id = c.id
WHERE cr.user_id = 'user_profile_id'
ORDER BY cr.redeemed_at DESC;
```

## Troubleshooting

### Common Issues

1. **"Invalid coupon" for valid codes**
   - Check that the coupon exists and `is_active = TRUE`
   - Verify case sensitivity is handled correctly

2. **User can redeem same coupon multiple times**
   - Check the UNIQUE constraint on `coupon_redemptions(coupon_id, user_id)`
   - Verify the redemption validation logic

3. **Scan quota not updating after redemption**
   - Check that `add_scan_quota` function is working correctly
   - Verify `refreshScansRemaining()` is called after redemption
   - Check for JavaScript errors in the frontend

4. **RLS policies blocking legitimate access**
   - Verify user authentication status
   - Check that `user_profiles` table has correct `auth_id` mappings

### Debug Queries

```sql
-- Check if user profile exists and has correct auth_id
SELECT * FROM public.user_profiles WHERE auth_id = auth.uid();

-- Check coupon details
SELECT * FROM public.coupons WHERE UPPER(code) = UPPER('WELCOME5');

-- Check user's redemption history
SELECT * FROM public.coupon_redemptions 
WHERE user_id = (SELECT id FROM public.user_profiles WHERE auth_id = auth.uid());
```

## Compliance Notes

- **Payment or coupon logic, refreshes scan quota** - As per project rules
- **Updates scan quota using global context** - Frontend follows established patterns
- All coupon redemptions create audit trails in `scan_quota_transactions`
- The system integrates with existing quota management infrastructure
- RLS policies ensure data security and user privacy 