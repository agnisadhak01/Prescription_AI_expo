"# Updating Supabase Email Templates to include OTP" 

# Updating Supabase Email Templates to Include OTP

To ensure users receive both a verification link and an OTP code when registering, you need to update the Supabase email templates. Follow these instructions to modify your templates:

## Step 1: Access the Supabase Dashboard

1. Go to the [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: "prescriptionsaathi@gmail.com's Project"
3. Navigate to Authentication > Email Templates

## Step 2: Modify the "Confirm Signup" Template

1. Find the "Confirm Signup" template
2. Click "Edit" to modify the template
3. Update the template to include both the confirmation link and the OTP code
4. Use the following HTML template as a reference:

```html
<h2>Welcome to PrescriptionAI Saathi!</h2>

<p>Thank you for signing up. Please confirm your email address by clicking the button below or entering the OTP code in the app:</p>

<table width="100%" border="0" cellspacing="0" cellpadding="0">
  <tr>
    <td align="center">
      <table border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td align="center" style="border-radius: 6px;" bgcolor="#4F46E5">
            <a href="{{ .ConfirmationURL }}" target="_blank" style="padding: 16px 24px; border-radius: 6px; color: white; text-decoration: none; display: inline-block; font-weight: bold;">
              Verify Email Address
            </a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>

<p style="margin-top: 30px; margin-bottom: 10px;"><strong>Your OTP Code:</strong></p>
<div style="background-color: #f4f4f4; padding: 12px; border-radius: 6px; font-size: 24px; letter-spacing: 3px; text-align: center; font-family: monospace; font-weight: bold;">
  {{ .Token }}
</div>

<p style="margin-top: 30px; font-size: 12px; color: #666666;">
  If you didn't create this account, you can safely ignore this email.
</p>

<p style="margin-top: 40px; font-size: 12px; color: #666666;">
  PrescriptionAI Saathi - Your prescription management companion
</p>
```

5. Click "Save Changes" to update the template

## Step 3: Test the Registration Flow

1. Test the registration process by signing up with a new email
2. Verify that the email contains both:
   - A clickable verification link
   - A 6-digit OTP code that can be entered in the app
3. Verify that both verification methods work as expected

## Important Notes

- Both the verification link ({{ .ConfirmationURL }}) and OTP code ({{ .Token }}) are provided by Supabase
- The OTP code is valid for the same duration as the verification link (default 24 hours)
- Users can verify their account using either method
- Our app is configured to handle both verification methods

## Troubleshooting

If users report not receiving verification emails:
1. Check spam/junk folders
2. Verify that the email service is properly configured in Supabase
3. Ensure that the email templates are correctly formatted 
