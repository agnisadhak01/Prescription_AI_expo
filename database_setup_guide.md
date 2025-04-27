# Database Setup Guide for Prescription AI

This guide will walk you through setting up the database for your Prescription AI application using Supabase.

## Prerequisites

1. A Supabase account
2. Access to the Supabase dashboard
3. The SQL scripts (`database_setup.sql` and `sample_data.sql`)

## Step 1: Create a New Supabase Project

1. Log in to your Supabase account
2. Click "New Project"
3. Enter a name for your project (e.g., "Prescription AI")
4. Choose a strong database password
5. Select a region closest to your users
6. Click "Create New Project"

## Step 2: Set Up Database Tables and Security Rules

1. In your new Supabase project, navigate to the "SQL Editor" section
2. Click "New Query"
3. Copy the contents of `database_setup.sql` into the query editor
4. Click "Run" to execute the SQL and set up your tables, indexes, and security policies

## Step 3: Set Up Supabase Storage

The application requires a storage bucket for prescription images:

1. Navigate to the "Storage" section in the Supabase dashboard
2. Click "Create New Bucket"
3. Name it `prescription-images`
4. Set the privacy to "Public" (we'll secure it with RLS policies)
5. Click "Create"

## Step 4: Set Up Storage Security Policies

Run the following SQL in the SQL Editor to set up RLS policies for your storage:

```sql
-- Create storage policies
BEGIN;
  -- Allow users to view their own files
  CREATE POLICY "Users can view their own prescription images"
  ON storage.objects FOR SELECT
  USING (
    auth.uid() = (
      SELECT user_id FROM prescriptions 
      WHERE id::text = (storage.foldername(name))[1]
    )
  );

  -- Allow users to upload their own files
  CREATE POLICY "Users can upload their own prescription images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    auth.uid() = (
      SELECT user_id FROM prescriptions 
      WHERE id::text = (storage.foldername(name))[1]
    )
  );

  -- Allow users to update their own files
  CREATE POLICY "Users can update their own prescription images"
  ON storage.objects FOR UPDATE
  USING (
    auth.uid() = (
      SELECT user_id FROM prescriptions 
      WHERE id::text = (storage.foldername(name))[1]
    )
  );

  -- Allow users to delete their own files
  CREATE POLICY "Users can delete their own prescription images"
  ON storage.objects FOR DELETE
  USING (
    auth.uid() = (
      SELECT user_id FROM prescriptions 
      WHERE id::text = (storage.foldername(name))[1]
    )
  );
COMMIT;
```

## Step 5: Set Up Authentication

1. Navigate to the "Authentication" section in the Supabase dashboard
2. Under "Email Templates", customize the templates as needed
3. Under "Settings" > "Auth Providers", ensure that "Email" is enabled
4. (Optional) Set up other providers like Google, Facebook, etc.

## Step 6: Generate API Keys and Configure Client

1. In the Supabase dashboard, go to "Settings" > "API"
2. Copy the "URL" and "anon public" key
3. Update the `supabaseClient.ts` file in your project with these values:

```typescript
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_KEY = 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
```

## Step 7: (Optional) Add Sample Data

Once you have created a user account through your app:

1. Get your user ID from the Supabase dashboard (Authentication > Users)
2. Open the `sample_data.sql` file
3. Replace `USER_ID_HERE` with your actual user ID
4. Run the script in the SQL Editor to add sample prescriptions to your database

## Step 8: Test Your Setup

1. Make sure your app is configured to use the correct Supabase credentials
2. Try logging in with a test account
3. Test creating, reading, updating, and deleting prescriptions
4. Verify that you can upload and retrieve prescription images

## Troubleshooting

### Common Issues:

1. **Authentication failures**: Ensure your API keys are correctly configured in the client
2. **Permission denied errors**: Check that your RLS policies are correctly set up
3. **Storage issues**: Verify that your storage bucket exists and has the correct policies
4. **Database errors**: Look at the Supabase logs for any SQL errors

If you encounter persistent issues, check the Supabase dashboard for logs and error messages. 