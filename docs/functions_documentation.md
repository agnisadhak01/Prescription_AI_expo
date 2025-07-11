# Functions Documentation

**Last Updated**: December 2024  
**Tech Stack**: React Native + Expo + TypeScript + Supabase  
**Database**: PostgreSQL (Supabase) with RPC Functions

## Overview

The Prescription AI app uses three types of functions:

1. **Supabase RPC Functions** - Server-side PostgreSQL functions called from the React Native client
2. **Supabase Edge Functions** - Deno-based serverless functions for webhooks and external integrations  
3. **React Native Client Functions** - TypeScript functions in the mobile app for UI logic and API integration

---

## **SUPABASE RPC FUNCTIONS**

These are PostgreSQL functions that run server-side and are called from the React Native client using `supabase.rpc()`.

### **Authentication & User Management**

#### `get_current_user_quota()` → `INTEGER`
**Purpose**: Get the current authenticated user's scan quota  
**Usage**: Used by AuthContext to display scan count in UI  
**Security**: Uses `auth.uid()` to get current user

```typescript
// React Native usage
const { data: quota, error } = await supabase.rpc('get_current_user_quota');
console.log('User has', quota, 'scans remaining');
```

```sql
-- Function definition (simplified)
CREATE FUNCTION get_current_user_quota() RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT scans_remaining 
    FROM profiles 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### `ensure_verified_user_quota()` → `BOOLEAN`
**Purpose**: Ensure verified users have minimum 3 free scans  
**Usage**: Called periodically to maintain quota consistency  
**Returns**: `true` if quota was adjusted, `false` if no change needed

```typescript
// React Native usage
const { data: adjusted } = await supabase.rpc('ensure_verified_user_quota');
if (adjusted) {
  // Refresh UI to show updated quota
  refreshScansRemaining();
}
```

---

### **Scan Quota Management**

#### `process_prescription(user_id UUID)` → `BOOLEAN`
**Purpose**: Deduct 1 scan when processing a prescription image  
**Usage**: Called before OCR processing to validate and deduct scan quota  
**Returns**: `true` if scan was deducted, `false` if insufficient quota

```typescript
// React Native usage
const { data: success, error } = await supabase.rpc('process_prescription', {
  user_id: user.id
});

if (success) {
  // Proceed with OCR processing
  processImageWithOCR(imageUri);
} else {
  // Show "out of scans" message
  Alert.alert('No Scans Remaining', 'Please purchase more scans to continue.');
}
```

#### `use_scan_quota(p_user_id UUID)` → `BOOLEAN`
**Purpose**: Deduct 1 scan with validation and audit trail  
**Usage**: Alternative to `process_prescription` with more detailed logging  
**Security**: Validates user exists and has available scans

```typescript
// React Native usage
try {
  const { data: success } = await supabase.rpc('use_scan_quota', {
    p_user_id: user.id
  });
  
  if (success) {
    // Update local quota optimistically
    setOptimisticScans(prev => prev - 1);
  }
} catch (error) {
  if (error.message.includes('No scans remaining')) {
    navigateToSubscription();
  }
}
```

#### `update_scan_quota(user_id_param UUID, scans_to_add INTEGER)` → `INTEGER`
**Purpose**: Add or subtract scans from user quota  
**Usage**: Used by admin functions or system corrections  
**Returns**: New quota amount after update

```typescript
// React Native usage (admin function)
const { data: newQuota } = await supabase.rpc('update_scan_quota', {
  user_id_param: userId,
  scans_to_add: 5  // Add 5 scans
});
```

#### `add_scan_quota(p_user_id UUID, p_amount INTEGER, p_type TEXT, p_reference TEXT)` → `BOOLEAN`
**Purpose**: Add scans with full audit trail and transaction recording  
**Usage**: Used for payments, coupons, and admin actions  
**Parameters**:
- `p_amount`: Number of scans to add
- `p_type`: Transaction type (`'purchase'`, `'coupon'`, `'admin'`, `'refund'`)
- `p_reference`: External reference (transaction ID, coupon code, etc.)

```typescript
// Used internally by payment webhook
const { data: success } = await supabase.rpc('add_scan_quota', {
  p_user_id: userId,
  p_amount: 5,
  p_type: 'purchase',
  p_reference: payuTransactionId
});
```

---

### **Payment Processing**

#### `add_scans_after_payment(user_id UUID, txn_id TEXT, amount NUMERIC, scans_to_add INTEGER)` → `VOID`
**Purpose**: **CRITICAL** - Process PayU webhook payments and credit scans  
**Usage**: Called exclusively by PayU webhook to add purchased scans  
**Security**: Prevents duplicate processing of same transaction  
**Recently Fixed**: Now correctly updates `profiles` table instead of deprecated `users` table

```typescript
// Used by PayU webhook (Edge Function)
await supabase.rpc('add_scans_after_payment', {
  user_id: userId,
  txn_id: payuTransactionId,
  amount: 149,
  scans_to_add: 5
});
```

**Payment Plans** (configured in PayU webhook):
- ₹149 → 5 scans
- ₹999 → 15 scans  
- ₹1999 → 35 scans

---

### **Coupon System**

#### `redeem_coupon(user_id UUID, coupon_code TEXT)` → `TEXT`
**Purpose**: Redeem coupon codes for scan credits  
**Usage**: Called from SubscriptionScreen when user enters coupon  
**Returns**: Status string (`'success'`, `'invalid_coupon'`, `'already_used'`, `'expired_coupon'`, `'max_redemptions_reached'`)

```typescript
// React Native usage in SubscriptionScreen
const handleApplyCoupon = async () => {
  const { data: result, error } = await supabase.rpc('redeem_coupon', {
    user_id: user.id,
    coupon_code: couponCode.trim()
  });

  switch (result) {
    case 'success':
      setCoupon('');
      await refreshScansRemaining();
      setFeedback('Coupon applied! Scans added.');
      setFeedbackType('success');
      break;
    case 'already_used':
      setFeedback('You have already used this coupon.');
      setFeedbackType('error');
      break;
    case 'expired_coupon':
      setFeedback('This coupon has expired.');
      setFeedbackType('error');
      break;
    default:
      setFeedback('Invalid coupon.');
      setFeedbackType('error');
  }
};
```

**Active Coupons**:
- **WELCOME5**: Gives 5 scans, one-time use per user, expires 2030-12-31

---

### **Notification System**

#### `get_user_notifications(include_read BOOLEAN, fetch_limit INTEGER, fetch_offset INTEGER)` → `RECORD[]`
**Purpose**: Fetch user notifications with pagination support  
**Usage**: Called by NotificationContext to load notifications  
**Security**: Only returns notifications for current authenticated user

```typescript
// React Native usage in NotificationContext
const fetchNotifications = async (includeRead = false, limit = 20, offset = 0) => {
  const { data: notifications, error } = await supabase.rpc('get_user_notifications', {
    include_read: includeRead,
    fetch_limit: limit,
    fetch_offset: offset
  });
  
  return notifications || [];
};
```

#### `mark_notification_read(notification_id UUID, mark_as_read BOOLEAN)` → `BOOLEAN`
**Purpose**: Mark individual notification as read or unread  
**Usage**: Called when user taps on notification  
**Returns**: `true` if notification was updated

```typescript
// React Native usage
const markAsRead = async (notificationId: string) => {
  const { data: success } = await supabase.rpc('mark_notification_read', {
    notification_id: notificationId,
    mark_as_read: true
  });
  
  if (success) {
    // Update local state
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
    );
  }
};
```

#### `mark_all_notifications_read()` → `INTEGER`
**Purpose**: Mark all user notifications as read  
**Usage**: Called from "Mark all as read" button  
**Returns**: Number of notifications marked as read

```typescript
// React Native usage
const markAllAsRead = async () => {
  const { data: count } = await supabase.rpc('mark_all_notifications_read');
  console.log(`Marked ${count} notifications as read`);
  
  // Refresh notifications list
  await fetchNotifications();
};
```

#### `count_unread_notifications()` → `INTEGER`
**Purpose**: Get count of unread notifications for badge display  
**Usage**: Called by NotificationContext for UI badge  
**Returns**: Number of unread notifications

```typescript
// React Native usage for badge
const getUnreadCount = async () => {
  const { data: count } = await supabase.rpc('count_unread_notifications');
  setUnreadCount(count || 0);
};
```

#### `create_notification(user_id UUID, title TEXT, message TEXT, notification_type TEXT, metadata JSONB)` → `UUID`
**Purpose**: Create new notification (used by triggers)  
**Usage**: Called by database triggers, not directly from client  
**Returns**: ID of created notification

---

### **Utility Functions**

#### `find_user_by_email(user_email TEXT)` → `UUID`
**Purpose**: Find user ID by email address (case-insensitive)  
**Usage**: Used by payment webhooks to identify users  
**Security**: Searches across auth.users, users, and profiles tables

#### `find_user_email_fuzzy(email_pattern TEXT)` → `RECORD[]`
**Purpose**: Search for users by email pattern (admin function)  
**Usage**: Administrative user lookup with fuzzy matching  
**Returns**: Array of user records with source table info

---

## **SUPABASE EDGE FUNCTIONS**

These are Deno-based serverless functions that run on Supabase Edge Runtime.

### **PayU Webhook** (`/functions/v1/payu-webhook`)

**Purpose**: Handle PayU payment notifications and credit scans to users  
**Recently Fixed**: Now correctly credits 5 scans for ₹149 payments (was only giving 1)  
**Security**: Validates payment data and prevents duplicate processing

#### Function Flow:
1. **Receive PayU webhook** with payment data
2. **Parse amount** and determine scan quota (₹149 → 5 scans)
3. **Find user** by email or user ID
4. **Validate transaction** not already processed
5. **Call `add_scans_after_payment()`** to credit scans
6. **Record transaction** in database
7. **Return success response** to PayU

#### Recent Bug Fix:
```typescript
// BEFORE (broken): Only matched exact "149"
const scanQuota = SCAN_QUOTA_PLANS[amount] || MIN_SCAN_QUOTA;

// AFTER (fixed): Handles "149.00", "149", etc.
const amountInt = Math.floor(parseFloat(amount));
const amountStr = amountInt.toString();

if (SCAN_QUOTA_PLANS[amount]) {
  scanQuota = SCAN_QUOTA_PLANS[amount];
} else if (SCAN_QUOTA_PLANS[amountStr]) {
  scanQuota = SCAN_QUOTA_PLANS[amountStr];
}
```

#### Configuration:
```typescript
const SCAN_QUOTA_PLANS = {
  "149": 5,    // ₹149 = 5 scans
  "999": 15,   // ₹999 = 15 scans  
  "1999": 35   // ₹1999 = 35 scans
};
```

#### Usage:
- **Automatic**: Called by PayU after payment completion
- **URL**: `https://[project].supabase.co/functions/v1/payu-webhook`
- **Method**: POST with payment data

### **Create PayU Button** (`/functions/v1/create-payu-button`)

**Purpose**: Generate PayU payment forms for scan purchases  
**Usage**: Called when user wants to make a payment  
**Returns**: HTML form for PayU payment processing

---

## **REACT NATIVE CLIENT FUNCTIONS**

These are TypeScript functions in the mobile app that handle UI logic and API integration.

### **AuthContext Functions**

#### `useAuth()` Hook
**Purpose**: Global authentication and scan quota state management  
**Location**: `components/AuthContext.tsx`

```typescript
interface AuthContextType {
  isAuthenticated: boolean;
  user: any;
  isEmailVerified: boolean;
  loading: boolean;
  scansRemaining: number | null;
  refreshScansRemaining: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<{ error?: string }>;
}
```

#### Key Functions:

##### `refreshScansRemaining()`
**Purpose**: Fetch current scan quota from database  
**Usage**: Called after payments, coupon redemption, scan usage

```typescript
const refreshScansRemaining = async () => {
  if (!user) return;
  try {
    const { data, error } = await supabase.rpc('get_current_user_quota');
    if (error) throw error;
    setScansRemaining(data || 0);
  } catch (err) {
    console.error('Failed to refresh scans remaining:', err);
    setScansRemaining(null);
  }
};
```

##### `login(email, password)`
**Purpose**: Authenticate user with Supabase Auth  
**Usage**: Called from LoginScreen

```typescript
const login = async (email: string, password: string) => {
  setLoading(true);
  const { error, data } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    setLoading(false);
    return { error: error.message };
  }
  setUser(data.user);
  setIsAuthenticated(true);
  setLoading(false);
  if (data.user) await fetchScansRemaining();
  return {};
};
```

##### `register(name, email, password)`
**Purpose**: Register new user with Supabase Auth  
**Usage**: Called from RegisterScreen  
**Note**: Profile is auto-created via database trigger

```typescript
const register = async (name: string, email: string, password: string) => {
  setLoading(true);
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
      },
    },
  });
  
  if (error) {
    setLoading(false);
    return { error: error.message };
  }
  
  setLoading(false);
  return {};
};
```

---

### **Notification Functions**

#### `NotificationContext` Functions
**Purpose**: Global notification state management  
**Location**: `components/NotificationContext.tsx`

##### `fetchNotifications()`
**Purpose**: Load notifications from database with pagination

```typescript
const fetchNotifications = async () => {
  try {
    const notifications = await supabase.rpc('get_user_notifications', {
      include_read: false,
      fetch_limit: 50,
      fetch_offset: 0
    });
    
    setNotifications(notifications || []);
    setUnreadCount(notifications?.filter(n => !n.is_read).length || 0);
  } catch (error) {
    console.error('Error fetching notifications:', error);
  }
};
```

---

### **Payment Functions**

#### `SubscriptionScreen` Functions
**Purpose**: Handle payment and coupon redemption UI  
**Location**: `app/screens/SubscriptionScreen.tsx`

##### `handleApplyCoupon()`
**Purpose**: Process coupon redemption with user feedback

```typescript
const handleApplyCoupon = async () => {
  if (!user || !coupon.trim()) return;
  
  setLoading(true);
  try {
    const { data, error } = await supabase.rpc('redeem_coupon', {
      user_id: user.id,
      coupon_code: coupon.trim(),
    });
    
    if (error) throw error;
    
    if (data === 'success') {
      setCoupon('');
      await refreshScansRemaining();
      setFeedback('Coupon applied! Scans added.');
      setFeedbackType('success');
    } else {
      // Handle different error types
      const errorMessages = {
        'expired_coupon': 'This coupon has expired.',
        'max_redemptions_reached': 'This coupon has reached its maximum redemptions.',
        'already_used': 'You have already used this coupon.',
      };
      setFeedback(errorMessages[data] || 'Invalid coupon.');
      setFeedbackType('error');
    }
  } catch (error) {
    setFeedback('Failed to redeem coupon. Please try again.');
    setFeedbackType('error');
  } finally {
    setLoading(false);
  }
};
```

---

### **Scan Processing Functions**

#### Camera and OCR Integration
**Purpose**: Handle prescription scanning with quota validation

```typescript
// Before processing image
const processPrescriptionImage = async (imageUri: string) => {
  // Check quota first
  const { data: hasQuota } = await supabase.rpc('process_prescription', {
    user_id: user.id
  });
  
  if (!hasQuota) {
    Alert.alert(
      'No Scans Remaining',
      'You have used all your scans. Please purchase more to continue.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Buy Scans', onPress: () => router.push('/subscription') }
      ]
    );
    return;
  }
  
  // Proceed with OCR processing
  try {
    const result = await performOCR(imageUri);
    // Handle successful scan
    refreshScansRemaining(); // Update UI quota
  } catch (error) {
    // Handle OCR error - note: scan was already deducted
    console.error('OCR processing failed:', error);
  }
};
```

---

## **DATABASE TRIGGERS**

These functions run automatically on database events.

### **User Management Triggers**

#### `handle_new_user_registration()` - TRIGGER
**Purpose**: Auto-create profile when user registers via Supabase Auth  
**Trigger**: ON INSERT to `auth.users`  
**Action**: Creates entry in `profiles` table with 0 initial scans

#### `handle_email_verification()` - TRIGGER  
**Purpose**: Add 3 free scans when user verifies email  
**Trigger**: ON UPDATE to `auth.users` when `email_confirmed_at` changes from NULL  
**Action**: Sets `profiles.scans_remaining = 3` and records in `scan_history`

### **Notification Triggers**

#### `trigger_scan_quota_notification()` - TRIGGER
**Purpose**: Auto-notify when scan quota is low  
**Trigger**: ON UPDATE to `profiles.scans_remaining`  
**Actions**:
- Creates notification when scans < 3: "Low Scan Quota Alert"
- Creates notification when scans = 0: "Out of Scans"

#### `trigger_payment_notification()` - TRIGGER
**Purpose**: Notify on successful payments  
**Trigger**: ON INSERT/UPDATE to `payment_transactions` when status = 'completed'  
**Action**: Creates "Payment Successful" notification with scan count

---

## **ERROR HANDLING PATTERNS**

### **RPC Function Error Handling**

```typescript
// Standard error handling pattern
const callRPCFunction = async () => {
  try {
    const { data, error } = await supabase.rpc('function_name', params);
    
    if (error) {
      console.error('RPC Error:', error);
      // Handle specific error types
      if (error.message.includes('No scans remaining')) {
        navigateToSubscription();
      }
      return;
    }
    
    // Handle success
    return data;
  } catch (error) {
    console.error('Network error:', error);
    Alert.alert('Error', 'Network error. Please try again.');
  }
};
```

### **Authentication Error Handling**

```typescript
// Handle authentication errors
const handleAuthError = (error: any) => {
  const errorMessages = {
    'Invalid login credentials': 'Incorrect email or password.',
    'Email not confirmed': 'Please verify your email before logging in.',
    'Too many requests': 'Too many login attempts. Please try again later.',
  };
  
  return errorMessages[error.message] || 'An error occurred. Please try again.';
};
```

---

## **SECURITY CONSIDERATIONS**

### **Function Security**
- All RPC functions use `SECURITY DEFINER` for elevated privileges
- Functions validate `auth.uid()` for user-specific operations  
- Payment functions include duplicate transaction prevention
- User data access restricted by Row Level Security (RLS)

### **Client Security**
- Never expose payment transaction IDs to client logs
- Validate scan quota on both client and server side
- Use optimistic UI updates with server validation
- Handle authentication state changes gracefully

---

## **PERFORMANCE OPTIMIZATION**

### **Caching Strategies**
```typescript
// Cache scan quota in AuthContext
const [scansRemaining, setScansRemaining] = useState<number | null>(null);

// Optimistic updates for better UX
const optimisticScanDeduction = () => {
  setOptimisticScans(prev => Math.max(0, prev - 1));
  // Server validation will correct if needed
};
```

### **Real-time Updates**
```typescript
// Listen for quota changes
useEffect(() => {
  if (!user) return;
  
  const channel = supabase
    .channel('profile-changes')
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'profiles',
      filter: `id=eq.${user.id}`
    }, (payload) => {
      setScansRemaining(payload.new.scans_remaining);
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [user]);
```

---

## **TESTING FUNCTIONS**

### **RPC Function Testing**

```typescript
// Test scan quota functions
const testScanQuota = async () => {
  // Get initial quota
  const initialQuota = await supabase.rpc('get_current_user_quota');
  
  // Use a scan
  const scanUsed = await supabase.rpc('use_scan_quota', {
    p_user_id: user.id
  });
  
  // Verify quota decreased
  const newQuota = await supabase.rpc('get_current_user_quota');
  expect(newQuota).toBe(initialQuota - 1);
};
```

### **Coupon Testing**

```typescript
// Test WELCOME5 coupon
const testWelcomeCoupon = async () => {
  const result = await supabase.rpc('redeem_coupon', {
    user_id: testUserId,
    coupon_code: 'WELCOME5'
  });
  
  expect(result).toBe('success');
  
  // Test duplicate redemption
  const duplicateResult = await supabase.rpc('redeem_coupon', {
    user_id: testUserId,
    coupon_code: 'WELCOME5'
  });
  
  expect(duplicateResult).toBe('already_used');
};
```

---

## **FUNCTION MIGRATION HISTORY**

### **Recent Changes (December 2024)**
1. ✅ **Fixed `add_scans_after_payment`** to use `profiles` table instead of deprecated `users`
2. ✅ **Fixed PayU webhook** scan quota calculation (₹149 → 5 scans)
3. ✅ **Updated all quota functions** to use `profiles` as primary table
4. ✅ **Implemented WELCOME5 coupon system** with `redeem_coupon` function
5. ✅ **Added notification system** with trigger-based auto-notifications

### **Deprecated Functions**
- ⚠️ `handle_user_login()` - Removed (login tracking via auth.users)
- ⚠️ `handle_new_user()` - Replaced by `handle_new_user_registration()`
- ⚠️ Functions referencing `users` table - All updated to use `profiles`

---

## **MONITORING & DEBUGGING**

### **Function Performance Monitoring**

```sql
-- Monitor slow RPC functions
SELECT 
  schemaname,
  funcname,
  calls,
  total_time,
  mean_time
FROM pg_stat_user_functions 
WHERE schemaname = 'public'
ORDER BY mean_time DESC;
```

### **Payment Function Monitoring**

```sql
-- Check recent payment processing
SELECT 
  transaction_id,
  amount,
  scans_added,
  status,
  created_at
FROM payment_transactions 
ORDER BY created_at DESC 
LIMIT 10;
```

---

**For the most current function definitions and parameters, always verify with the Supabase Dashboard or SQL introspection queries.** 