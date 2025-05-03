/**
 * Update Supabase Email Templates
 * 
 * This script updates the email templates for a Supabase project
 * using the Supabase Management API.
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

// Configuration
const SUPABASE_ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN; // Get this from your Supabase account
const PROJECT_ID = 'fwvwxzvynfrqjvizcejf'; // Your project ID

// Path to template file
const TEMPLATE_PATH = path.join(__dirname, 'supabase/templates/confirmation.html');

// Read the template file
const templateContent = fs.readFileSync(TEMPLATE_PATH, 'utf8');

/**
 * Update email templates via Supabase Management API
 */
async function updateEmailTemplates() {
  if (!SUPABASE_ACCESS_TOKEN) {
    console.error('Error: SUPABASE_ACCESS_TOKEN environment variable is required');
    console.error('Please create a .env file with your Supabase access token');
    console.error('You can generate one at https://supabase.com/dashboard/account/tokens');
    process.exit(1);
  }

  console.log('Updating email templates...');
  console.log('Using token:', SUPABASE_ACCESS_TOKEN.substring(0, 5) + '...');
  console.log('Project ID:', PROJECT_ID);

  // Base URL for Supabase Management API
  const API_URL = 'https://api.supabase.com';

  try {
    // First, let's try to get the current templates to see if the API is working
    console.log('Testing API access with a GET request...');
    
    const testResponse = await fetch(`${API_URL}/v1/projects/${PROJECT_ID}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`
      }
    });

    if (!testResponse.ok) {
      const error = await testResponse.json();
      throw new Error(`API test failed: ${JSON.stringify(error)}`);
    }

    console.log('API test successful, proceeding with template update...');

    // Using the correct API endpoint for email templates
    const response = await fetch(`${API_URL}/v1/projects/${PROJECT_ID}/auth/email/templates/signup/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`
      },
      body: JSON.stringify({
        subject: 'Confirm your PrescriptionAI Saathi registration',
        content: templateContent
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`API error: ${JSON.stringify(error)}`);
    }

    console.log('✅ Email template updated successfully!');
  } catch (error) {
    console.error('Failed to update email template:', error.message);
    process.exit(1);
  }
}

// Execute the function
updateEmailTemplates(); 