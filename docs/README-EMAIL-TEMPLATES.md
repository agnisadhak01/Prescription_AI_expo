# Updating Supabase Email Templates

This README provides instructions on how to update Supabase email templates programmatically, both for local development and hosted projects.

## Local Development

For local development with Supabase, you can customize email templates using the `config.toml` file.

### Steps:

1. Create template files in `supabase/templates/` directory (already done in this repository):
   - `confirmation.html`: The email confirmation template with both link and OTP

2. Configure the templates in `supabase/config.toml`:
   ```toml
   [auth.email.template.confirmation]
   subject = "Confirm your PrescriptionAI Saathi registration"
   content_path = "./templates/confirmation.html"
   ```

3. Apply changes by restarting Supabase:
   - Windows: Run `.\update-templates-cli.ps1`
   - macOS/Linux: Run `./update-templates-cli.sh`

## Hosted Projects

For hosted Supabase projects, you need to use the Management API to update email templates.

### Steps:

1. Generate an access token:
   - Go to https://supabase.com/dashboard/account/tokens
   - Create a new access token with appropriate permissions

2. Create a `.env` file with your token:
   ```
   SUPABASE_ACCESS_TOKEN=your_token_here
   ```

3. Install dependencies:
   ```
   npm install dotenv node-fetch
   ```

4. Run the update script:
   ```
   node update-email-templates.js
   ```

## Template Variables

The following variables are available in email templates:

- `{{ .ConfirmationURL }}`: The verification link
- `{{ .Token }}`: The 6-digit OTP code
- `{{ .TokenHash }}`: Hashed version of the token
- `{{ .SiteURL }}`: Your application's site URL
- `{{ .Email }}`: The user's email address

## Testing

After updating templates, test the registration flow to verify that:
1. Emails are sent with both the verification link and OTP
2. The verification link works correctly
3. The OTP can be entered in the app for verification 