# PayU Payment Integration

This document outlines how to set up and use the PayU payment integration in the Prescription AI app.

## Overview

The app uses PayU's payment buttons to process payments for scan credits. The integration consists of:

1. A Supabase Edge Function that generates a PayU payment form
2. A webhook endpoint to handle payment notifications
3. Deep linking to return users to the app after payment
4. React Native UI components to display the payment flow

## Setup Instructions

### 1. PayU Account Setup

1. Register for a PayU merchant account at [https://onboarding.payu.in/](https://onboarding.payu.in/)
2. After account activation, obtain your Merchant Key and Salt from the PayU dashboard
3. Set up success and failure URLs to point to your webhook endpoints:
   - Success URL: `https://fwvwxzvynfrqjvizcejf.functions.supabase.co/payu-webhook?status=success`
   - Failure URL: `https://fwvwxzvynfrqjvizcejf.functions.supabase.co/payu-webhook?status=failure`

### 2. Environment Variables

Add the following environment variables to your Supabase project:

```bash
PAYU_MERCHANT_KEY=your_merchant_key_here
PAYU_SALT=your_salt_here
```

### 3. Database Setup

Execute the SQL scripts in the following order:

1. `supabase/functions/db_setup/payments_tables.sql` - Creates tables for payment tracking
2. `supabase/functions/db_setup/add_scans_function.sql` - Adds the function to process payments

### 4. Deploy Edge Functions

Deploy the Supabase Edge Functions:

```bash
supabase functions deploy create-payu-button
supabase functions deploy payu-webhook
```

### 5. Deep Linking Setup

Configure your app to handle deep links from PayU with the following scheme:

- Scheme: `prescription-ai://payment-result`
- Parameters: `status`, `message` (optional)

The app.json has been updated to include this configuration.

## How It Works

1. **Payment Initiation**:
   - User clicks "Buy Now" button on the Subscription screen
   - App calls the `create-payu-button` function to generate a payment form
   - A WebView modal opens with the PayU payment form

2. **Payment Processing**:
   - User completes payment in the WebView
   - PayU redirects to success or failure URL with transaction details
   - The webhook function processes the payment and adds scans to the user's account

3. **App Return Flow**:
   - The webhook redirects to the app using the deep link scheme
   - App shows success or error message and refreshes the scan count

## Troubleshooting

- **Payment form not loading**: Check that PAYU_MERCHANT_KEY and PAYU_SALT are correctly set in Supabase environment variables
- **Webhook not receiving notifications**: Verify your PayU dashboard settings for success and failure URLs
- **Deep linking not working**: Ensure your app's scheme is registered correctly in app.json and that you've rebuilt the app

## Testing

For testing payments, use the PayU test credentials provided in your PayU dashboard.

Typical test card numbers:
- Success case: `4012001037141112`
- Failure case: `5123456789012346`

Always use CVV `123` and any future expiry date for testing. 