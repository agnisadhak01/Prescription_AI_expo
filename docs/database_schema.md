# Database Schema Documentation

**Last Updated**: December 2024  
**Tech Stack**: React Native + Expo + TypeScript + Supabase  
**Database**: PostgreSQL (Supabase)

## Overview

The Prescription AI app uses Supabase as its backend database with PostgreSQL as the underlying engine. The database is designed to support:

- User management and authentication (via Supabase Auth + custom profiles)
- Prescription scanning and OCR data storage  
- Scan quota management and payment processing
- Coupon system for scan credits
- User notifications
- Activity tracking and audit trails

## Core Architecture

### **Authentication Model**
- **`auth.users`** (Supabase managed) - Primary authentication and user records
- **`public.profiles`** (App managed) - Extended user data and scan quota management

### **Data Flow**
```
User Registration → auth.users → profiles (trigger) → scan quota management
Payment → PayU webhook → profiles.scans_remaining → scan_history
Coupon → redeem_coupon() → profiles → scan_history  
Scan Usage → process_prescription() → profiles.scans_remaining-- → scan_history
```

---

## **ACTIVE TABLES**

### 1. **profiles** (Primary User Table)
**Purpose**: Main user data storage and scan quota management

```sql
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY,                    -- References auth.users.id
    email TEXT,                             -- User email address
    full_name TEXT,                         -- User's full name
    avatar_url TEXT,                        -- Profile picture URL
    scans_remaining INTEGER NOT NULL DEFAULT 0,  -- Current scan quota
    is_subscribed BOOLEAN DEFAULT false,    -- Subscription status
    coupons_used TEXT[] DEFAULT ARRAY[]::text[], -- Redeemed coupon codes
    created_at TIMESTAMPTZ DEFAULT now(),   -- Account creation time
    updated_at TIMESTAMPTZ DEFAULT now()    -- Last modification time
);
```

**Key Features**:
- ✅ **Primary source of scan quota** (app reads from here)
- ✅ **Coupon redemption tracking** via `coupons_used` array
- ✅ **Auto-created** when user registers via trigger
- ✅ **Updated by payments** via PayU webhook

---

### 2. **coupons**
**Purpose**: Coupon code management and validation

```sql
CREATE TABLE public.coupons (
    code TEXT PRIMARY KEY,                  -- Coupon code (e.g., "WELCOME5")
    type TEXT NOT NULL,                     -- Coupon type (e.g., "extra_scans")
    value INTEGER NOT NULL,                 -- Number of scans to add
    expiry TIMESTAMPTZ,                     -- Expiration date (NULL = no expiry)
    max_redemptions INTEGER NOT NULL DEFAULT 1, -- Maximum uses allowed
    times_redeemed INTEGER NOT NULL DEFAULT 0   -- Current redemption count
);
```

**Current Active Coupons**:
- **WELCOME5**: 5 scans, expires 2030-12-31, 999,999 max redemptions

---

### 3. **payment_transactions** 
**Purpose**: Payment history and transaction tracking

```sql
CREATE TABLE public.payment_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,                           -- References auth.users.id
    transaction_id TEXT NOT NULL UNIQUE,    -- PayU transaction ID
    amount NUMERIC NOT NULL,                -- Payment amount in INR
    scans_added INTEGER NOT NULL,           -- Scans credited for this payment
    payment_method TEXT NOT NULL,           -- Payment method ("payu")
    status TEXT NOT NULL,                   -- Transaction status ("completed", "cancelled")
    created_at TIMESTAMPTZ DEFAULT now(),   -- Transaction timestamp
    metadata JSONB                          -- Additional payment data
);
```

**Payment Plans**:
- ₹149 → 5 scans
- ₹999 → 15 scans  
- ₹1999 → 35 scans

---

### 4. **scan_history**
**Purpose**: Audit trail for all scan quota changes

```sql
CREATE TABLE public.scan_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,                           -- References auth.users.id
    action_type TEXT NOT NULL,              -- "usage", "purchase", "coupon", "free"
    scans_changed INTEGER NOT NULL,         -- +/- scan count change
    description TEXT,                       -- Human-readable description
    created_at TIMESTAMPTZ DEFAULT now(),   -- When the action occurred
    metadata JSONB                          -- Additional context data
);
```

**Action Types**:
- `usage`: Scan used (-1)
- `purchase`: Payment completed (+5, +15, +35)
- `coupon`: Coupon redeemed (+5 for WELCOME5)
- `free`: Email verification (+3)
- `quota_correction`: System corrections

---

### 5. **scan_quota_transactions**
**Purpose**: Legacy transaction tracking (maintained for historical data)

```sql
CREATE TABLE public.scan_quota_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,                           -- References auth.users.id
    transaction_id TEXT NOT NULL,           -- External transaction ID
    amount NUMERIC NOT NULL,                -- Transaction amount
    scan_quota INTEGER NOT NULL,            -- Scans allocated
    status TEXT NOT NULL,                   -- Transaction status
    payment_details JSONB,                  -- Raw payment data
    created_at TIMESTAMPTZ DEFAULT now()    -- Transaction timestamp
);
```

---

### 6. **prescriptions**
**Purpose**: Prescription data from OCR processing

```sql
CREATE TABLE public.prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,                 -- References auth.users.id
    doctor_name TEXT,                       -- Prescribing doctor
    patient_name TEXT,                      -- Patient name
    date DATE,                              -- Prescription date
    diagnosis TEXT,                         -- Medical diagnosis
    notes TEXT,                             -- Additional notes
    alternate_medicine TEXT,                -- Alternative medicine suggestions
    home_remedies TEXT,                     -- Home remedy suggestions
    created_at TIMESTAMPTZ DEFAULT now()   -- Processing timestamp
);
```

---

### 7. **medications**
**Purpose**: Individual medications from prescriptions

```sql
CREATE TABLE public.medications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prescription_id UUID,                   -- Foreign key to prescriptions.id
    name TEXT,                              -- Medication name
    dosage TEXT,                            -- Dosage information
    frequency TEXT,                         -- Frequency of use
    duration TEXT,                          -- Treatment duration
    instructions TEXT,                      -- Usage instructions
    
    FOREIGN KEY (prescription_id) REFERENCES prescriptions(id) ON DELETE CASCADE
);
```

---

### 8. **prescription_images**
**Purpose**: Storage URLs for prescription images

```sql
CREATE TABLE public.prescription_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prescription_id UUID,                   -- Foreign key to prescriptions.id
    image_url TEXT,                         -- Supabase Storage URL
    
    FOREIGN KEY (prescription_id) REFERENCES prescriptions(id) ON DELETE CASCADE
);
```

---

### 9. **notifications**
**Purpose**: User notifications and alerts

```sql
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,                 -- References auth.users.id
    title TEXT NOT NULL,                    -- Notification title
    message TEXT NOT NULL,                  -- Notification content
    type TEXT NOT NULL,                     -- Notification type
    is_read BOOLEAN DEFAULT false,          -- Read status
    metadata JSONB,                         -- Additional notification data
    created_at TIMESTAMPTZ DEFAULT now(),   -- Creation timestamp
    updated_at TIMESTAMPTZ DEFAULT now()    -- Last update timestamp
);
```

**Notification Types**:
- `scan_quota`: Low quota warnings
- `subscription`: Payment confirmations
- `login`: New login alerts

---

## **DEPRECATED TABLES**

### ⚠️ **users** (Legacy - Use `profiles` instead)
**Status**: Deprecated - kept for backup during migration  
**Issue**: Some functions still reference this table but app only reads from `profiles`  
**Migration**: Data migrated to `profiles`, functions updated to use `profiles`

---

## **KEY RELATIONSHIPS**

### **User Data Flow**
```
auth.users (Supabase Auth)
    ↓ (1:1, managed by triggers)
profiles (App user data + scan quota)
    ↓ (1:many)
prescriptions → medications
              → prescription_images
    ↓ (1:many)
scan_history (quota changes)
payment_transactions (payment history)
notifications (user alerts)
```

### **Logical Foreign Keys**
*Note: Not enforced as DB constraints due to auth.users being in different schema*

- `profiles.id` → `auth.users.id`
- `prescriptions.user_id` → `auth.users.id`
- `scan_history.user_id` → `auth.users.id`
- `payment_transactions.user_id` → `auth.users.id`
- `notifications.user_id` → `auth.users.id`

---

## **DATABASE FUNCTIONS**

### **Authentication & User Management**

#### `handle_new_user_registration()` - TRIGGER
**Purpose**: Auto-create profile when user registers  
**Trigger**: ON INSERT to `auth.users`
```sql
-- Creates profiles entry with 0 scans (scans added on email verification)
```

#### `handle_email_verification()` - TRIGGER  
**Purpose**: Add 3 free scans when user verifies email  
**Trigger**: ON UPDATE to `auth.users` when email confirmed
```sql
-- Adds 3 scans to profiles.scans_remaining
-- Records action in scan_history
```

---

### **Scan Quota Management**

#### `get_current_user_quota()` → INTEGER
**Purpose**: Get current user's scan quota (used by React Native app)
```sql
SELECT scans_remaining FROM profiles WHERE id = auth.uid()
```

#### `process_prescription(user_id UUID)` → BOOLEAN
**Purpose**: Deduct 1 scan when processing prescription
```sql
-- Checks if user has scans available
-- Decrements profiles.scans_remaining
-- Records usage in scan_history
-- Returns true if successful
```

#### `update_scan_quota(user_id UUID, scans_to_add INTEGER)` → INTEGER
**Purpose**: Add/subtract scans from user quota
```sql
-- Updates profiles.scans_remaining
-- Returns new quota amount
```

#### `use_scan_quota(user_id UUID)` → BOOLEAN
**Purpose**: Deduct 1 scan with validation
```sql
-- Validates user has scans
-- Decrements quota
-- Records in scan_history
```

---

### **Payment Processing**

#### `add_scans_after_payment(user_id UUID, txn_id TEXT, amount NUMERIC, scans_to_add INTEGER)`
**Purpose**: Process PayU webhook payments (CRITICAL FUNCTION)
```sql
-- Validates transaction not already processed
-- Updates profiles.scans_remaining  
-- Records in payment_transactions
-- Records in scan_history
-- Used by PayU webhook endpoint
```

#### `add_scan_quota(user_id UUID, amount INTEGER, type TEXT, reference TEXT)` → BOOLEAN
**Purpose**: Add scans with full audit trail
```sql
-- Updates profiles.scans_remaining
-- Records detailed transaction in scan_history
-- Used for payments, coupons, admin actions
```

---

### **Coupon System**

#### `redeem_coupon(user_id UUID, coupon_code TEXT)` → TEXT
**Purpose**: Redeem coupon codes (used by React Native app)
```sql
-- Validates coupon exists and not expired
-- Checks user hasn't already used it
-- Updates profiles.scans_remaining
-- Adds coupon to profiles.coupons_used array
-- Increments coupons.times_redeemed
-- Returns: 'success', 'invalid_coupon', 'already_used', 'expired_coupon'
```

---

### **Notification System**

#### `get_user_notifications(include_read BOOLEAN, fetch_limit INTEGER, fetch_offset INTEGER)`
**Purpose**: Fetch user notifications with pagination
```sql
-- Returns notifications for current user (auth.uid())
-- Supports read/unread filtering
-- Includes pagination support
```

#### `mark_notification_read(notification_id UUID, mark_as_read BOOLEAN)` → BOOLEAN
**Purpose**: Mark individual notification as read/unread

#### `mark_all_notifications_read()` → INTEGER  
**Purpose**: Mark all user notifications as read

#### `count_unread_notifications()` → INTEGER
**Purpose**: Get count of unread notifications for current user

#### `create_notification(user_id UUID, title TEXT, message TEXT, type TEXT, metadata JSONB)` → UUID
**Purpose**: Create new notification (used by triggers)

---

### **Notification Triggers**

#### `trigger_scan_quota_notification()` - TRIGGER
**Purpose**: Auto-notify when scan quota is low  
**Trigger**: ON UPDATE to `profiles.scans_remaining`
```sql
-- Creates notification when scans < 3
-- Creates notification when scans = 0
```

#### `trigger_payment_notification()` - TRIGGER
**Purpose**: Notify on successful payments  
**Trigger**: ON INSERT/UPDATE to `payment_transactions`

---

### **Utility Functions**

#### `find_user_by_email(email TEXT)` → UUID
**Purpose**: Find user ID by email across multiple tables

#### `ensure_verified_user_quota()` → BOOLEAN
**Purpose**: Ensure verified users have minimum 3 scans

---

## **SECURITY (Row Level Security)**

### **RLS Policies**

```sql
-- Profiles: Users can only access their own data
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Prescriptions: Users can only access their own prescriptions  
CREATE POLICY "prescriptions_select_own" ON prescriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "prescriptions_insert_own" ON prescriptions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Notifications: Users can only access their own notifications
CREATE POLICY "notifications_select_own" ON notifications FOR SELECT USING (auth.uid() = user_id);

-- Scan History: Users can only view their own scan history
CREATE POLICY "scan_history_select_own" ON scan_history FOR SELECT USING (auth.uid() = user_id);
```

### **Function Security**
- All functions use `SECURITY DEFINER` for elevated privileges
- Functions validate `auth.uid()` for user-specific operations
- Payment functions include duplicate transaction prevention

---

## **INDEXES**

### **Performance Indexes**
```sql
-- User lookups
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_scans_remaining ON profiles(scans_remaining);

-- Prescription queries
CREATE INDEX idx_prescriptions_user_id ON prescriptions(user_id);
CREATE INDEX idx_prescriptions_created_at ON prescriptions(created_at);

-- Payment tracking
CREATE INDEX idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX idx_payment_transactions_transaction_id ON payment_transactions(transaction_id);

-- Scan history queries
CREATE INDEX idx_scan_history_user_id ON scan_history(user_id);
CREATE INDEX idx_scan_history_created_at ON scan_history(created_at DESC);

-- Notification queries
CREATE INDEX idx_notifications_user_id_unread ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
```

---

## **DATA TYPES & CONVENTIONS**

### **UUID Usage**
- Primary keys use UUID for security and distribution
- Generated via `gen_random_uuid()` or `uuid_generate_v4()`
- Links to Supabase Auth UUIDs

### **Timestamps**
- All timestamps use `TIMESTAMPTZ` (with timezone)
- Default to `now()` for creation timestamps
- Updated via triggers for `updated_at` fields

### **JSON Storage**
- `metadata` fields use `JSONB` for flexible data storage
- Used for payment details, notification context, scan history context

---

## **EDGE FUNCTIONS INTEGRATION**

### **PayU Webhook** (`/functions/v1/payu-webhook`)
- Calls `add_scans_after_payment()` function
- Handles payment completion and scan crediting
- Manages duplicate transaction prevention

### **Prescription Processing**
- Uses `process_prescription()` for scan quota validation
- Integrates with OCR services for data extraction

---

## **REACT NATIVE CLIENT USAGE**

### **TypeScript Integration**
```typescript
// Database row types (generate via supabase gen types)
interface Profile {
  id: string;
  email: string;
  full_name: string;
  scans_remaining: number;
  coupons_used: string[];
  created_at: string;
  updated_at: string;
}

// RPC function calls
const { data: quota } = await supabase.rpc('get_current_user_quota');
const { data: result } = await supabase.rpc('redeem_coupon', {
  user_id: user.id,
  coupon_code: 'WELCOME5'
});
```

### **Real-time Subscriptions**
```typescript
// Listen for scan quota changes
supabase
  .channel('profile-changes')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'profiles',
    filter: `id=eq.${user.id}`
  }, (payload) => {
    // Update UI with new scan quota
  })
  .subscribe();
```

---

## **MIGRATION HISTORY**

### **Recent Changes (December 2024)**
1. ✅ **Fixed PayU webhook** to use `profiles` table instead of `users`
2. ✅ **Migrated user data** from `users` to `profiles` 
3. ✅ **Updated all functions** to use `profiles` as primary table
4. ✅ **Removed stale tables**: `payments`, `user_sessions`
5. ✅ **Implemented coupon system** with WELCOME5 active coupon

### **Deprecated Components**
- ⚠️ `users` table (backup only - can be removed after verification)
- ⚠️ Functions referencing `users` table (all updated)

---

## **MONITORING & MAINTENANCE**

### **Health Checks**
```sql
-- Verify data consistency
SELECT 
  (SELECT COUNT(*) FROM auth.users) as auth_users,
  (SELECT COUNT(*) FROM profiles) as profiles,
  (SELECT COUNT(*) FROM profiles WHERE scans_remaining > 0) as users_with_scans;

-- Check coupon usage
SELECT code, value, times_redeemed, max_redemptions 
FROM coupons ORDER BY times_redeemed DESC;

-- Recent payment activity
SELECT DATE(created_at), COUNT(*), SUM(amount), SUM(scans_added)
FROM payment_transactions 
WHERE status = 'completed' 
GROUP BY DATE(created_at) 
ORDER BY DATE(created_at) DESC LIMIT 7;
```

### **Performance Monitoring**
- Monitor slow queries on `scan_history` (large table)
- Track `profiles` table updates (high frequency)
- Monitor webhook response times for payments

---

## **BEST PRACTICES**

### **Development**
1. ✅ Always use `profiles` table for user data (not `users`)
2. ✅ Use RPC functions for scan quota operations
3. ✅ Include audit trails via `scan_history` for quota changes
4. ✅ Validate scan quota before allowing scans
5. ✅ Handle payment webhooks idempotently

### **Security**
1. ✅ Enable RLS on all user-facing tables
2. ✅ Validate `auth.uid()` in all user-specific functions
3. ✅ Use `SECURITY DEFINER` for privileged operations
4. ✅ Never expose raw payment transaction IDs to client

### **Performance**
1. ✅ Use indexed columns for frequent queries
2. ✅ Implement pagination for large datasets
3. ✅ Cache scan quota on client side with real-time updates
4. ✅ Monitor database performance metrics

---

**For the most current information, always verify with the actual database schema using Supabase Dashboard or SQL introspection queries.** 