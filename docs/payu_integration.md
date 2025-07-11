# PayU Payment Integration

**Last Updated**: December 2024  
**Status**: ✅ Active and Working  
**Recent Fix**: Webhook amount parsing for ₹149 payments now correctly adds 5 scans

This document outlines how to set up and use the PayU payment integration in the Prescription AI app for purchasing scan credits.

## Overview

The app uses PayU's payment gateway to process payments for scan credits. The integration consists of:

1. **Supabase Edge Function** (`create-payu-button`) that generates PayU payment forms
2. **Webhook Endpoint** (`payu-webhook`) to handle payment notifications and credit scans
3. **React Native WebView** to display the payment flow
4. **Real-time UI Updates** to reflect new scan quota after payment

---

## **SCAN QUOTA PRICING PLANS**

### **Current Payment Plans**
The app supports three payment tiers with different scan quotas:

| Amount | Scans | Price per Scan | Savings | Description |
|--------|-------|----------------|---------|-------------|
| **₹149** | **5 scans** | ₹29.80 | - | Basic Plan |
| **₹999** | **15 scans** | ₹66.60 | 33% savings | Most Popular |
| **₹1999** | **35 scans** | ₹57.11 | 43% savings | Best Value |

### **Scan Quota Configuration (Webhook)**
The PayU webhook determines scan allocation based on payment amount:

```typescript
const SCAN_QUOTA_PLANS = {
  "149": 5,     // ₹149 = 5 scans
  "999": 15,    // ₹999 = 15 scans  
  "1999": 35    // ₹1999 = 35 scans
};

const MIN_SCAN_QUOTA = 1; // Minimum scans for any successful payment
```

### **Recent Bug Fix (December 2024)**
**Issue**: PayU webhook was only giving 1 scan for ₹149 payments instead of 5 scans  
**Cause**: PayU sends amount as "149.00" but code only matched exact "149" string  
**Fix**: Improved amount parsing to handle decimal formats

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
} else {
  scanQuota = MIN_SCAN_QUOTA;
}
```

---

## **TECHNICAL SETUP**

### **1. PayU Account Setup**

1. **Register** for a PayU merchant account at [https://onboarding.payu.in/](https://onboarding.payu.in/)
2. **Obtain credentials** from PayU dashboard:
   - Merchant Key
   - Salt (for hash generation)
3. **Configure webhook URLs** in PayU dashboard:
   - Success URL: `https://fwvwxzvynfrqjvizcejf.supabase.co/functions/v1/payu-webhook`
   - Failure URL: `https://fwvwxzvynfrqjvizcejf.supabase.co/functions/v1/payu-webhook`

> **Note**: Use the same webhook URL for both success and failure. The webhook handles both cases based on payment status.

### **2. Environment Variables**

Add the following environment variables to your Supabase project settings:

```bash
# PayU Production Credentials
PAYU_MERCHANT_KEY=your_production_merchant_key
PAYU_SALT=your_production_salt

# PayU Test Credentials (for development)
PAYU_MERCHANT_KEY_TEST=your_test_merchant_key
PAYU_SALT_TEST=your_test_salt
```

### **3. Database Setup**

The payment system uses the following tables (auto-created via migrations):

- `payment_transactions` - Store PayU payment records
- `profiles` - User scan quota tracking
- `scan_quota_transactions` - Audit trail for scan changes

**Key Database Function**:
```sql
-- Function called by webhook to credit scans
CREATE OR REPLACE FUNCTION add_scans_after_payment(
  user_id UUID,
  txn_id TEXT,
  amount NUMERIC,
  scans_to_add INTEGER
) RETURNS VOID AS $$
BEGIN
  -- Check for duplicate transactions
  IF EXISTS (SELECT 1 FROM payment_transactions WHERE transaction_id = txn_id) THEN
    RAISE NOTICE 'Transaction % already processed', txn_id;
    RETURN;
  END IF;
  
  -- Insert payment record
  INSERT INTO payment_transactions (user_id, transaction_id, amount, scans_added, status)
  VALUES (user_id, txn_id, amount, scans_to_add, 'completed');
  
  -- Add scans to user profile
  UPDATE profiles 
  SET scans_remaining = scans_remaining + scans_to_add 
  WHERE id = user_id;
  
  -- Record quota transaction
  INSERT INTO scan_quota_transactions (user_id, amount, transaction_type, reference_id)
  VALUES (user_id, scans_to_add, 'payment', txn_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### **4. Deploy Edge Functions**

Deploy the required Supabase Edge Functions:

```bash
# Create PayU payment forms
supabase functions deploy create-payu-button

# Handle payment webhooks (CRITICAL for scan crediting)
supabase functions deploy payu-webhook

# Verify deployment
supabase functions list
```

**Important**: Ensure Docker Desktop is running before deploying functions.

---

## **PAYMENT FLOW ARCHITECTURE**

### **1. Payment Initiation**
```
User clicks "Buy Now" → SubscriptionScreen → create-payu-button function → WebView with PayU form
```

**React Native Implementation**:
```typescript
const handlePayment = async (amount: number) => {
  try {
    setLoading(true);
    
    // Call Supabase Edge Function to create PayU form
    const { data, error } = await supabase.functions.invoke('create-payu-button', {
      body: {
        amount: amount,
        productinfo: `${PAYMENT_PLANS[amount].scans} Prescription Scans`,
        firstname: user.user_metadata?.full_name || 'User',
        email: user.email,
        phone: ''
      }
    });

    if (error) throw error;

    // Open PayU form in WebView
    setPaymentHtml(data.html);
    setShowPayment(true);
  } catch (error) {
    Alert.alert('Error', 'Failed to initiate payment. Please try again.');
  } finally {
    setLoading(false);
  }
};
```

### **2. Payment Processing**
```
PayU Gateway → User Payment → PayU Webhook → Database Update → Real-time UI Update
```

**Webhook Flow**:
1. **Receive PayU Data**: Parse form data from PayU POST request
2. **Determine Scan Quota**: Based on amount using `SCAN_QUOTA_PLANS`
3. **Find User**: Match email to user in database (case-insensitive)
4. **Validate Transaction**: Check for duplicates using transaction ID
5. **Credit Scans**: Call `add_scans_after_payment()` function
6. **Create Notification**: Auto-generated via database trigger
7. **Return Success**: Respond to PayU with 'SUCCESS'

**Webhook Code Excerpt**:
```typescript
// Parse payment amount and determine scans
const amount = formData.get('amount')?.toString() || '';
const amountInt = Math.floor(parseFloat(amount));
const amountStr = amountInt.toString();

let scanQuota = MIN_SCAN_QUOTA;
if (SCAN_QUOTA_PLANS[amount]) {
  scanQuota = SCAN_QUOTA_PLANS[amount];
} else if (SCAN_QUOTA_PLANS[amountStr]) {
  scanQuota = SCAN_QUOTA_PLANS[amountStr];
}

console.log(`Amount: ${amount}, Parsed: ${amountStr}, Scans: ${scanQuota}`);
```

### **3. UI Update**
```
Webhook Success → Real-time Subscription → AuthContext Refresh → UI Badge Update
```

**Real-time Updates**:
The app uses Supabase real-time subscriptions to automatically update the UI when scan quota changes:

```typescript
// AuthContext.tsx - Real-time quota updates
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

  return () => supabase.removeChannel(channel);
}, [user]);
```

---

## **SECURITY CONSIDERATIONS**

### **1. Webhook Security**
- **Duplicate Prevention**: Transaction IDs are unique constraints
- **Email Validation**: Case-insensitive user lookup with `ilike`
- **Amount Validation**: Minimum scan quota prevents zero-scan payments
- **Error Handling**: Graceful handling of invalid users/amounts

### **2. Payment Security**
- **HTTPS Only**: All webhook communication over secure connections
- **No Client-Side Secrets**: Merchant keys never exposed to React Native app
- **Hash Verification**: PayU hash validation (if implemented)

### **3. Database Security**
- **Row Level Security**: Users can only access their own payment records
- **Function Security**: `add_scans_after_payment()` uses `SECURITY DEFINER`
- **Audit Trail**: All quota changes recorded in `scan_quota_transactions`

---

## **MONITORING & DEBUGGING**

### **1. Webhook Monitoring**
Monitor webhook performance and errors:

```sql
-- Check recent payment transactions
SELECT 
  transaction_id,
  amount,
  scans_added,
  status,
  created_at
FROM payment_transactions 
ORDER BY created_at DESC 
LIMIT 10;

-- Check scan quota history
SELECT 
  amount,
  transaction_type,
  reference_id,
  balance_after,
  created_at
FROM scan_quota_transactions 
WHERE user_id = 'user-uuid'
ORDER BY created_at DESC;
```

### **2. Common Issues**

#### **Issue**: Payments successful but no scans added
**Diagnosis**:
1. Check PayU dashboard webhook delivery logs
2. Check Supabase Edge Function logs
3. Verify webhook URL configuration

**Solution**:
```bash
# Check webhook logs
supabase functions logs payu-webhook

# Test webhook manually
curl -X POST "https://fwvwxzvynfrqjvizcejf.supabase.co/functions/v1/payu-webhook" \
  -d "amount=149&email=test@example.com&status=success&txnid=TEST123"
```

#### **Issue**: Amount parsing errors
**Fixed in December 2024**: Webhook now handles both "149" and "149.00" formats

#### **Issue**: User not found errors
**Common Cause**: Email case mismatch between PayU and database  
**Solution**: Webhook uses `decodeURIComponent()` and case-insensitive matching

### **3. Testing Webhook**

**Manual Test**:
```bash
# Test with PowerShell (Windows)
Invoke-WebRequest -Uri "https://fwvwxzvynfrqjvizcejf.supabase.co/functions/v1/payu-webhook" `
  -Method POST `
  -Body "amount=149&email=test@example.com&status=success&txnid=TEST_$(Get-Date -Format 'yyyyMMddHHmmss')" `
  -ContentType "application/x-www-form-urlencoded"

# Test with curl (Linux/Mac/Git Bash)
curl -X POST "https://fwvwxzvynfrqjvizcejf.supabase.co/functions/v1/payu-webhook" \
  -d "amount=149&email=test@example.com&status=success&txnid=TEST_$(date +%s)"
```

---

## **TESTING ENVIRONMENT**

### **1. PayU Test Credentials**
Use PayU-provided test credentials for development:

```javascript
// Test mode configuration
const PAYU_CONFIG = {
  test: {
    merchantKey: process.env.PAYU_MERCHANT_KEY_TEST,
    salt: process.env.PAYU_SALT_TEST,
    paymentUrl: 'https://test.payu.in/_payment'
  },
  production: {
    merchantKey: process.env.PAYU_MERCHANT_KEY,
    salt: process.env.PAYU_SALT,
    paymentUrl: 'https://secure.payu.in/_payment'
  }
};
```

### **2. Test Cards**
Use these test card numbers in PayU sandbox:

| Purpose | Card Number | CVV | Expiry | Expected Result |
|---------|-------------|-----|--------|-----------------|
| Success | `4012001037141112` | `123` | Any future date | Payment success |
| Failure | `5123456789012346` | `123` | Any future date | Payment failure |
| Invalid | `4000000000000002` | `123` | Any future date | Card declined |

### **3. Test Flow**
1. Use test merchant credentials in development
2. Make ₹149 test payment
3. Verify webhook receives data
4. Check that 5 scans are added to test user
5. Confirm UI updates in real-time

---

## **DEPLOYMENT CHECKLIST**

### **Production Deployment**
- [ ] PayU production credentials added to Supabase environment
- [ ] Webhook URL updated in PayU dashboard
- [ ] Edge functions deployed with latest code
- [ ] Database functions updated
- [ ] Real payment test with ₹1 (minimum amount)
- [ ] Verify ₹149 → 5 scans allocation
- [ ] Test UI updates after successful payment
- [ ] Monitor webhook logs for first 24 hours

### **Environment Configuration**
- [ ] Production PayU merchant key set
- [ ] Production PayU salt set  
- [ ] Webhook URL points to production Supabase project
- [ ] Database RLS policies properly configured
- [ ] Error logging and monitoring enabled

---

## **RECENT UPDATES**

### **December 2024 - Critical PayU Fix**
- ✅ **Fixed**: ₹149 payments now correctly add 5 scans (was adding only 1)
- ✅ **Improved**: Amount parsing handles decimal formats ("149.00")
- ✅ **Enhanced**: Better logging for debugging payment issues
- ✅ **Deployed**: Updated webhook in production environment

### **Payment Success Verification**
After the December 2024 fix, the following has been verified:
- ₹149 payment → 5 scans added ✅
- Real-time UI updates working ✅
- Database audit trail complete ✅
- Notification system triggered ✅

---

## **TROUBLESHOOTING GUIDE**

### **Payment Form Issues**
- **Problem**: Payment form not loading in WebView
- **Solution**: Check merchant key and network connectivity
- **Debug**: Review `create-payu-button` function logs

### **Webhook Issues**
- **Problem**: Payments successful but scans not credited
- **Solution**: Verify webhook URL in PayU dashboard
- **Debug**: Check Edge Function logs and database records

### **User Interface Issues**
- **Problem**: Scan count not updating after payment
- **Solution**: Verify real-time subscription is active
- **Debug**: Check AuthContext connection status

### **Testing Issues**
- **Problem**: Test payments failing
- **Solution**: Ensure using test credentials and test card numbers
- **Debug**: Compare test vs production configuration

---

**For live support during payment issues, check the Supabase Edge Function logs and PayU dashboard webhook delivery status.** 