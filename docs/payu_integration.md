# PayU Integration Documentation

## Overview
This document provides comprehensive documentation for the PayU payment gateway integration in the Prescription AI Saathi application, including current implementation status, known issues, and troubleshooting guides.

## Current Status

### ✅ Working Components
- **Payment Button Generation**: Create PayU button function working correctly
- **Payment Processing**: PayU processes payments successfully
- **Webhook Reception**: Webhook receives payment confirmations
- **Transaction Recording**: Payment transactions stored in database

### ⚠️ Known Issues
- **Scan Quota Crediting**: PayU payments may not credit scans due to wrong table usage
- **Function Update Required**: `add_scans_after_payment` function updates `users` instead of `profiles`

## Integration Architecture

### Payment Flow
1. **User Initiates Payment**: User selects scan package in app
2. **Payment Button Generation**: App calls `create-payu-button` Edge Function
3. **PayU Processing**: User completes payment on PayU platform
4. **Webhook Notification**: PayU sends confirmation to webhook
5. **Scan Quota Update**: Webhook processes payment and credits scans
6. **User Notification**: App notifies user of successful payment

### Components

#### 1. Create PayU Button (`/functions/v1/create-payu-button`)
**Status**: ✅ **ACTIVE**
**Location**: `supabase/functions/create-payu-button/index.ts`

**Purpose**: Generate PayU payment buttons for different scan packages

**Features**:
- Creates payment URLs for different scan packages
- Handles payment amount calculations
- Generates secure payment links
- Supports multiple payment plans

**Payment Plans**:
```typescript
const SCAN_QUOTA_PLANS = {
  "149": 5,    // ₹149 = 5 scans
  "999": 15,   // ₹999 = 15 scans  
  "1999": 35   // ₹1999 = 35 scans
};
```

**Configuration**:
```toml
[functions.create-payu-button]
verify_jwt = false
```

#### 2. PayU Webhook (`/functions/v1/payu-webhook`)
**Status**: ✅ **ACTIVE**
**Location**: `supabase/functions/payu-webhook/index.ts`

**Purpose**: Handle PayU payment confirmations and credit scans

**Features**:
- Validates PayU webhook signatures
- Prevents duplicate transaction processing
- Updates user scan quota
- Records payment transaction
- Sends confirmation notification

**Configuration**:
```toml
[functions.payu-webhook]
enabled = true
verify_jwt = false
import_map = "./functions/payu-webhook/deno.json"
entrypoint = "./functions/payu-webhook/index.ts"
```

## Implementation Details

### Environment Variables
```env
EXPO_PUBLIC_PAYU_MERCHANT_KEY=your_payu_merchant_key
EXPO_PUBLIC_PAYU_SALT=your_payu_salt
```

### Payment Button Generation
```typescript
// Frontend usage
const handlePayment = async (amount: number, scans: number) => {
  try {
    const response = await fetch('/functions/v1/create-payu-button', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amount,
        scans: scans,
        user_id: user.id,
        email: user.email
      })
    });
    
    const { paymentUrl } = await response.json();
    // Open payment URL in WebView
  } catch (error) {
    console.error('Payment initiation failed:', error);
  }
};
```

### Webhook Processing
```typescript
// Webhook receives payment data
const processPayment = async (paymentData: any) => {
  // Validate payment signature
  const isValid = validatePayUSignature(paymentData);
  if (!isValid) {
    return { error: 'Invalid signature' };
  }
  
  // Check for duplicate processing
  const existingTransaction = await checkExistingTransaction(paymentData.txnid);
  if (existingTransaction) {
    return { error: 'Transaction already processed' };
  }
  
  // Credit scans to user
  const result = await addScansAfterPayment(
    paymentData.email,
    paymentData.amount,
    paymentData.txnid
  );
  
  return { success: true, scansAdded: result.scansAdded };
};
```

## Database Integration

### Payment Transaction Storage
```sql
-- Payment transactions table
CREATE TABLE payment_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  amount DECIMAL(10,2) NOT NULL,
  scans_added INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  transaction_id TEXT UNIQUE,
  payment_method TEXT DEFAULT 'payu',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);
```

### Scan Quota Updates
```sql
-- Function to add scans after payment
CREATE OR REPLACE FUNCTION add_scans_after_payment(
  user_id UUID,
  amount INTEGER,
  transaction_id TEXT
) RETURNS BOOLEAN AS $$
BEGIN
  -- ⚠️ ISSUE: Currently updates users table instead of profiles
  UPDATE users 
  SET scans_remaining = scans_remaining + amount
  WHERE id = user_id;
  
  -- ✅ FIX REQUIRED: Update to use profiles table
  -- UPDATE profiles 
  -- SET scans_remaining = scans_remaining + amount
  -- WHERE id = user_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
```

## Current Issues and Fixes

### Issue 1: Wrong Table Usage
**Problem**: `add_scans_after_payment` function updates `users` table instead of `profiles`
**Impact**: PayU payments may not reflect in app UI
**Status**: ⚠️ **NEEDS FIX**

**Solution**:
```sql
-- Update function to use profiles table
CREATE OR REPLACE FUNCTION add_scans_after_payment(
  user_id UUID,
  amount INTEGER,
  transaction_id TEXT
) RETURNS BOOLEAN AS $$
BEGIN
  -- Update profiles table instead of users
  UPDATE profiles 
  SET scans_remaining = scans_remaining + amount
  WHERE id = user_id;
  
  -- Record transaction
  INSERT INTO payment_transactions (
    user_id, amount, scans_added, transaction_id, status
  ) VALUES (
    user_id, amount, amount, transaction_id, 'completed'
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
```

### Issue 2: Amount Parsing
**Problem**: PayU sends amounts as strings that need proper parsing
**Status**: ✅ **FIXED**

**Solution**:
```typescript
// Handle different amount formats
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

## Testing

### Test Scenarios
1. **Payment Initiation**: Test payment button generation
2. **Payment Processing**: Test PayU payment completion
3. **Webhook Reception**: Test webhook data processing
4. **Scan Crediting**: Test scan quota updates
5. **Duplicate Prevention**: Test duplicate transaction handling

### Test Data
```typescript
// Test payment data
const testPaymentData = {
  txnid: 'test-transaction-123',
  amount: '149.00',
  email: 'test@example.com',
  status: 'success',
  hash: 'test-hash'
};
```

### Manual Testing
1. **Development Environment**: Use PayU test credentials
2. **Payment Simulation**: Use PayU test payment methods
3. **Webhook Testing**: Test webhook with sample data
4. **Database Verification**: Check transaction and quota updates

## Security Considerations

### Webhook Security
- **Signature Validation**: Verify PayU webhook signatures
- **HTTPS Only**: Ensure all communication uses HTTPS
- **Input Validation**: Validate all webhook data
- **Duplicate Prevention**: Prevent double processing

### Payment Security
- **Transaction Verification**: Verify payment status with PayU
- **Amount Validation**: Validate payment amounts
- **User Verification**: Ensure payment is for valid user
- **Audit Trail**: Maintain complete transaction logs

## Monitoring and Debugging

### Logging
```typescript
// Webhook logging
console.log('PayU webhook received:', {
  transactionId: paymentData.txnid,
  amount: paymentData.amount,
  email: paymentData.email,
  status: paymentData.status
});
```

### Error Handling
```typescript
// Comprehensive error handling
try {
  const result = await processPayment(paymentData);
  return { success: true, data: result };
} catch (error) {
  console.error('Payment processing error:', error);
  return { 
    success: false, 
    error: error.message,
    transactionId: paymentData.txnid 
  };
}
```

### Health Checks
```sql
-- Check recent payment activity
SELECT 
  DATE(created_at) as date,
  COUNT(*) as transactions,
  SUM(amount) as total_amount,
  SUM(scans_added) as total_scans
FROM payment_transactions 
WHERE status = 'completed' 
GROUP BY DATE(created_at) 
ORDER BY date DESC 
LIMIT 7;
```

## Troubleshooting

### Common Issues

#### 1. Payment Not Crediting Scans
**Symptoms**: Payment successful but scans not added to user account
**Causes**: 
- Wrong table usage in `add_scans_after_payment` function
- Webhook not receiving payment confirmation
- Database transaction failure

**Solutions**:
1. Check webhook logs for errors
2. Verify function updates correct table
3. Check database transaction logs
4. Verify user exists in correct table

#### 2. Duplicate Transaction Processing
**Symptoms**: Same payment credited multiple times
**Causes**: Webhook called multiple times, duplicate prevention not working

**Solutions**:
1. Check transaction_id uniqueness
2. Verify duplicate checking logic
3. Review webhook retry mechanisms

#### 3. Payment Button Not Working
**Symptoms**: Payment button not generating or opening
**Causes**: Edge function error, network issues, configuration problems

**Solutions**:
1. Check Edge function logs
2. Verify environment variables
3. Test function directly
4. Check network connectivity

### Debug Steps
1. **Check Webhook Logs**: Review Supabase function logs
2. **Verify Database**: Check payment_transactions table
3. **Test Function**: Call functions directly with test data
4. **Check PayU Dashboard**: Verify payment status in PayU
5. **Review Network**: Check network requests and responses

## Future Enhancements

### Planned Improvements
1. **Enhanced Error Handling**: Better error messages and recovery
2. **Payment Analytics**: Detailed payment reporting
3. **Refund Processing**: Automated refund handling
4. **Multiple Payment Methods**: Support for additional payment gateways

### Performance Optimization
1. **Caching**: Cache payment configurations
2. **Async Processing**: Background payment processing
3. **Batch Operations**: Batch payment processing
4. **Monitoring**: Advanced payment monitoring

## Support and Resources

### PayU Documentation
- [PayU Integration Guide](https://payu.in/docs)
- [PayU API Reference](https://payu.in/api)
- [PayU Webhook Documentation](https://payu.in/webhooks)

### Supabase Resources
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Supabase Database](https://supabase.com/docs/guides/database)
- [Supabase Auth](https://supabase.com/docs/guides/auth)

### Contact Information
- **PayU Support**: PayU merchant support
- **Technical Support**: contact@autoomstudio.com
- **Documentation**: Comprehensive documentation available

---

*This PayU integration documentation reflects the current state of the Prescription AI Saathi application as of v1.0.6. For the most up-to-date information, refer to the latest codebase and implementation.* 