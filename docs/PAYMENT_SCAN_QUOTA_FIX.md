# PayU Payment Scan Quota Fix

## 🔧 Issue Fixed

**Problem**: PayU payments were only adding +1 scan instead of +5 scans for ₹149 payments.

**Root Cause**: The amount matching logic in the PayU webhook was too strict. PayU sends amounts like `"149.00"` but the code was only matching exact string `"149"`.

## ✅ Solution Applied

Updated the `supabase/functions/payu-webhook/index.ts` file with improved amount matching logic:

### Before (Broken):
```javascript
const scanQuota = SCAN_QUOTA_PLANS[amount] || MIN_SCAN_QUOTA;
```

### After (Fixed):
```javascript
// Get scan quota for amount - handle different amount formats
let scanQuota = MIN_SCAN_QUOTA;

// Convert amount to integer for matching (removes decimals)
const amountInt = Math.floor(parseFloat(amount));
const amountStr = amountInt.toString();

console.log('Amount received:', amount, 'Converted to:', amountStr);

// Try exact match first, then converted amount
if (SCAN_QUOTA_PLANS[amount]) {
  scanQuota = SCAN_QUOTA_PLANS[amount];
  console.log('Exact amount match found:', scanQuota, 'scans');
} else if (SCAN_QUOTA_PLANS[amountStr]) {
  scanQuota = SCAN_QUOTA_PLANS[amountStr];
  console.log('Converted amount match found:', scanQuota, 'scans');
} else {
  console.log('No amount match found, using minimum:', MIN_SCAN_QUOTA, 'scans');
  console.log('Available amounts:', Object.keys(SCAN_QUOTA_PLANS));
}
```

## 📋 What This Fix Does

1. **Accepts Multiple Amount Formats**: Now handles `"149"`, `"149.00"`, `149`, etc.
2. **Better Logging**: Shows exactly what amount was received and how it was processed
3. **Fallback Logic**: First tries exact match, then converted integer match
4. **Debug Information**: Logs available amounts for troubleshooting

## 🚀 Deployment Instructions

### Option 1: Deploy with Supabase CLI (Recommended)

1. **Start Docker Desktop** (required for local deployment)
2. **Deploy the function**:
   ```bash
   supabase functions deploy payu-webhook
   ```

### Option 2: Deploy via Dashboard

1. Go to your Supabase dashboard
2. Navigate to Edge Functions
3. Select `payu-webhook` function
4. Copy the updated code from `supabase/functions/payu-webhook/index.ts`
5. Deploy through the web interface

### Option 3: Alternative CLI Deployment

If Docker Desktop isn't available, you can use:
```bash
npx supabase functions deploy payu-webhook --no-verify-jwt
```

## 🧪 How to Test the Fix

### Test with ₹149 Payment:
1. Complete a PayU payment for ₹149
2. Check the webhook logs in Supabase Dashboard > Edge Functions > payu-webhook > Logs
3. Look for these log messages:
   - `"Amount received: 149.00 Converted to: 149"`
   - `"Converted amount match found: 5 scans"`
   - `"Updated scan quota for user X with 5 scans"`

### Expected Results:
- **Before Fix**: User gets +1 scan
- **After Fix**: User gets +5 scans ✅

## 📊 Payment Plan Configuration

The webhook now correctly handles these amounts:

| Amount (INR) | Scans Added | Status |
|-------------|-------------|---------|
| ₹149        | 5 scans     | ✅ Fixed |
| ₹999        | 15 scans    | ✅ Working |
| ₹1999       | 35 scans    | ✅ Working |
| Other amounts| 1 scan     | ✅ Fallback |

## 🔍 Verification Checklist

After deployment:
- [ ] Make a test payment for ₹149
- [ ] Verify user receives exactly 5 scans
- [ ] Check webhook logs for proper amount matching
- [ ] Confirm app UI updates scan count correctly
- [ ] Test WELCOME5 coupon still works (gives +5 scans)

## 🚨 Important Notes

1. **Deployment Required**: The fix won't work until the function is deployed
2. **Docker Desktop**: Required for CLI deployment
3. **Backup**: Your original webhook code is preserved in git history
4. **Testing**: Use small amounts for testing to avoid unnecessary charges

## 📞 Next Steps

1. **Deploy the function** using one of the methods above
2. **Test with a real payment** (or test environment)
3. **Monitor the logs** to confirm the fix is working
4. **Update your team** about the fix

---

**Status**: ✅ Code updated, ready for deployment
**Impact**: Users will now receive correct scan amounts for payments
**Risk**: Low (improved logging and fallback logic included) 