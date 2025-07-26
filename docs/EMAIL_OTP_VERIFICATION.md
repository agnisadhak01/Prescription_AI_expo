# Email Verification with OTP

This document explains the implementation of email verification with OTP in the Prescription AI app.

## Overview

The app now supports two methods of email verification after registration:

1. Clicking the verification link sent to the user's email
2. Entering the OTP (One-Time Password) code displayed in the email

## Implementation Details

### Email Template

The Supabase email template has been customized to include both:
- A verification link (using `{{ .ConfirmationURL }}`)
- A 6-digit OTP code (using `{{ .Token }}`)

See the `supabase-email-template-instructions.md` file for detailed steps on how to update the email template in the Supabase dashboard.

### Verification Screen

The `VerifyOTPScreen.tsx` component has been updated to:
- Accept and verify 6-digit OTP codes
- Provide a resend functionality with a cooldown timer
- Display clear instructions to the user
- Handle verification errors

### Navigation Flow

1. After registration, users are redirected to the OTP verification screen
2. Users can either:
   - Enter the OTP received in their email
   - Click the verification link in their email (which will automatically verify their account)
3. Once verified, users are redirected to the main app
4. If users try to access protected routes while unverified, they are redirected to the verification screen

### AuthContext

The `AuthContext.tsx` file provides the following functions for email verification:
- `resendVerificationEmail()`: Resends the verification email with a new OTP
- `refreshSession()`: Updates the user session after successful verification

## Testing

To test the verification flow:
1. Register a new user with a valid email
2. Check the email for both the verification link and OTP code
3. Test both verification methods:
   - Copy and paste the OTP in the app
   - Click the verification link

## Troubleshooting

If users encounter issues:
1. Ensure the email templates are correctly configured in Supabase
2. Check that the OTP verification type is set to 'signup' in the code
3. Verify that users are properly redirected to the verification screen
4. Check for any errors in the console during the verification process 