#!/bin/bash

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null
then
    echo "Supabase CLI is not installed. Installing..."
    npm install -g supabase
fi

echo "Updating email templates using Supabase CLI..."

# For local development, this will apply the template changes
echo "Restarting Supabase services to apply template changes..."
supabase stop && supabase start

echo "✅ Local templates updated successfully!"

# For hosted projects, you need to use the Management API approach (see update-email-templates.js)
echo ""
echo "NOTE: For hosted projects, you'll need to:"
echo "1. Generate an access token at https://supabase.com/dashboard/account/tokens"
echo "2. Create a .env file with your SUPABASE_ACCESS_TOKEN"
echo "3. Run 'node update-email-templates.js' to update the hosted project" 