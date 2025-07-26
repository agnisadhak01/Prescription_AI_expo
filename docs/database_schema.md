# Database Schema Documentation

## Overview
This document provides a comprehensive overview of the Prescription AI Saathi database schema, including all tables, functions, triggers, and recent migrations.

## Database Version
- **Last Updated**: July 25, 2025
- **Current Version**: v1.0.6
- **Total Tables**: 12 active tables
- **Total Functions**: 15+ functions
- **Recent Migrations**: 3 completed

## Active Tables

### 1. `profiles` - Primary User Data
**Status**: ✅ **ACTIVE** - Primary user table used by the application
**Rows**: 37+ users

```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  scans_remaining INTEGER DEFAULT 0,
  coupons_used TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Key Features**:
- Primary user data storage
- Scan quota management
- Coupon usage tracking
- RLS enabled with user-specific policies

### 2. `coupons` - Coupon Management
**Status**: ✅ **ACTIVE** - Coupon system for promotional offers
**Rows**: 4 coupons

```sql
CREATE TABLE public.coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  scan_amount INTEGER NOT NULL DEFAULT 0,
  max_redemptions INTEGER DEFAULT NULL,
  current_redemptions INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ DEFAULT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Active Coupons**:
- `WELCOME5` - 5 free scans for new users (unlimited redemptions)
- `FREESCANS` - Free scan coupon
- `FREESCAN` - Single free scan
- `PREMIUM5` - Premium 5 scans (expired)

### 3. `coupon_redemptions` - Coupon Usage Tracking
**Status**: ✅ **ACTIVE** - Tracks coupon usage by users

```sql
CREATE TABLE public.coupon_redemptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  redeemed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(coupon_id, user_id)
);
```

### 4. `payment_transactions` - Payment History
**Status**: ✅ **ACTIVE** - PayU payment transaction records
**Rows**: 3+ transactions

```sql
CREATE TABLE public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  amount DECIMAL(10,2) NOT NULL,
  scans_added INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  transaction_id TEXT UNIQUE,
  payment_method TEXT DEFAULT 'payu',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);
```

### 5. `notifications` - User Notifications
**Status**: ✅ **ACTIVE** - In-app notification system
**Rows**: 30+ notifications

```sql
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 6. `prescriptions` - Prescription Records
**Status**: ✅ **ACTIVE** - Main prescription data
**Rows**: 37+ prescriptions

```sql
CREATE TABLE public.prescriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  patient_name TEXT,
  doctor_name TEXT,
  prescription_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 7. `prescription_images` - Image Storage
**Status**: ✅ **ACTIVE** - Prescription image data
**Rows**: 36+ images

```sql
CREATE TABLE public.prescription_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prescription_id UUID NOT NULL REFERENCES public.prescriptions(id),
  image_url TEXT NOT NULL,
  image_data BYTEA,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 8. `medications` - Medication Database
**Status**: ✅ **ACTIVE** - Medication information
**Rows**: 96+ medications

```sql
CREATE TABLE public.medications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  generic_name TEXT,
  dosage_form TEXT,
  strength TEXT,
  manufacturer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 9. `scan_history` - Scan Activity Tracking
**Status**: ✅ **ACTIVE** - User scan activity
**Rows**: 127+ scans

```sql
CREATE TABLE public.scan_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  scan_type TEXT NOT NULL,
  result_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 10. `scan_quota_transactions` - Quota Transaction Log
**Status**: ✅ **ACTIVE** - Detailed quota transaction history
**Rows**: 38+ transactions

```sql
CREATE TABLE public.scan_quota_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  transaction_type scan_transaction_type NOT NULL,
  amount INTEGER NOT NULL,
  balance_before INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  reference_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Stale Tables (Candidates for Removal)

### 1. `payments` - **UNUSED**
**Status**: 🗑️ **STALE** - Empty table, superseded by `payment_transactions`
**Rows**: 0

```sql
-- This table is empty and unused
-- Superseded by payment_transactions table
-- RECOMMENDATION: DELETE
```

### 2. `user_sessions` - **UNUSED**
**Status**: 🗑️ **STALE** - Empty table, no references in code
**Rows**: 0

```sql
-- This table is empty and has no references
-- RECOMMENDATION: DELETE
```

### 3. `users` - **PROBLEMATIC**
**Status**: ⚠️ **REDUNDANT** - Inconsistent usage, data sync issues
**Rows**: 40+ users

```sql
-- This table is redundant with profiles table
-- Some functions update users, some update profiles
-- Creates data sync issues
-- RECOMMENDATION: MIGRATE DATA TO PROFILES THEN DELETE
```

## Database Functions

### Core Functions

#### 1. `redeem_coupon(user_id UUID, coupon_code TEXT)`
**Status**: ✅ **ACTIVE**
**Purpose**: Redeem coupon codes for scan quota
**Returns**: 'success', 'invalid_coupon', 'already_used', 'expired_coupon', 'max_redemptions_reached'

#### 2. `get_current_user_quota()`
**Status**: ✅ **ACTIVE**
**Purpose**: Get current user's scan quota
**Returns**: Integer representing scans remaining

#### 3. `add_scan_quota(user_id UUID, amount INTEGER, transaction_type scan_transaction_type, reference_id TEXT)`
**Status**: ✅ **ACTIVE**
**Purpose**: Add scan quota to user account
**Used by**: Payment webhooks, coupon redemption

#### 4. `process_prescription(image_data BYTEA, user_id UUID)`
**Status**: ✅ **ACTIVE**
**Purpose**: Process prescription images and extract medication data
**Returns**: JSON with extracted medication information

### Functions Requiring Updates

#### 1. `add_scans_after_payment(user_id UUID, amount INTEGER, transaction_id TEXT)`
**Status**: ⚠️ **NEEDS UPDATE**
**Issue**: Updates `users` table instead of `profiles`
**Fix Required**: Update to use `profiles` table

#### 2. `handle_new_user(user_id UUID, email TEXT)`
**Status**: ⚠️ **NEEDS UPDATE**
**Issue**: Creates records in `users` instead of `profiles`
**Fix Required**: Update to use `profiles` table

## Recent Migrations

### ✅ Completed Migrations

#### 1. `create_coupon_system.sql`
**Date**: December 2024
**Purpose**: Implement coupon system
**Changes**:
- Created `coupons` table
- Created `coupon_redemptions` table
- Added `redeem_coupon` function
- Implemented RLS policies
- Added WELCOME5 coupon

#### 2. `create_quota_tables.sql`
**Date**: December 2024
**Purpose**: Implement quota management system
**Changes**:
- Created `scan_quota_transactions` table
- Added quota transaction tracking
- Implemented quota management functions

#### 3. `process_prescription_function.sql`
**Date**: December 2024
**Purpose**: Enhance prescription processing
**Changes**:
- Updated `process_prescription` function
- Improved medication extraction
- Enhanced error handling

## Row Level Security (RLS)

### Enabled Tables
- `profiles` - Users can only access their own data
- `coupons` - Read-only access for authenticated users
- `coupon_redemptions` - Users can only see their own redemptions
- `payment_transactions` - Users can only see their own transactions
- `notifications` - Users can only see their own notifications
- `prescriptions` - Users can only access their own prescriptions
- `prescription_images` - Users can only access their own images
- `scan_history` - Users can only see their own scan history
- `scan_quota_transactions` - Users can only see their own transactions

### RLS Policies
Each table has appropriate policies ensuring users can only access their own data while maintaining security and data isolation.

## Indexes

### Performance Indexes
- `idx_coupons_code` - Fast coupon code lookups
- `idx_coupons_active_expires` - Active coupon filtering
- `idx_coupon_redemptions_user_id` - User redemption history
- `idx_coupon_redemptions_coupon_id` - Coupon usage tracking
- `idx_notifications_user_id` - User notification queries
- `idx_prescriptions_user_id` - User prescription queries
- `idx_scan_history_user_id` - User scan history queries

## Data Migration Plan

### Phase 1: Analysis
1. Compare `users` vs `profiles` data
2. Identify missing user records
3. Analyze data consistency issues

### Phase 2: Migration
1. Migrate missing users to `profiles`
2. Update all functions to use `profiles`
3. Verify data integrity

### Phase 3: Cleanup
1. Drop `payments` table
2. Drop `user_sessions` table
3. Drop `users` table after verification

## Monitoring and Maintenance

### Regular Tasks
- Monitor table growth and performance
- Review and update RLS policies
- Clean up old notification data
- Archive old scan history
- Update coupon expiry dates

### Health Checks
- Verify data consistency between related tables
- Monitor function performance
- Check for orphaned records
- Validate RLS policy effectiveness

## Backup and Recovery

### Backup Strategy
- Daily automated backups
- Point-in-time recovery capability
- Cross-region backup replication
- Encrypted backup storage

### Recovery Procedures
- Documented recovery procedures for each table
- Tested restore processes
- Data integrity verification post-restore

## Security Considerations

### Data Protection
- All sensitive data encrypted at rest
- TLS encryption for data in transit
- Regular security audits
- Access logging and monitoring

### Compliance
- GDPR compliance for EU users
- CCPA compliance for California users
- Data retention policies
- User data deletion procedures

## Future Enhancements

### Planned Improvements
- Enhanced analytics and reporting
- Advanced notification system
- Improved prescription processing
- Better quota management
- Enhanced security features

### Scalability Considerations
- Partitioning strategies for large tables
- Read replica configuration
- Connection pooling optimization
- Query performance monitoring 