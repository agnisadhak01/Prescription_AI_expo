// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Create Supabase client with service role for DB operations
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
)

// Verify PayU webhook signature
function verifyPayUSignature(payload: any, receivedHash: string): boolean {
  if (!payload || !receivedHash) return false;
  
  try {
    const merchantKey = Deno.env.get('PAYU_MERCHANT_KEY') || '';
    const merchantSalt = Deno.env.get('PAYU_SALT') || '';
    
    // Get essential payment fields
    const { txnid, amount, status } = payload;
    
    // Create string to hash according to PayU docs
    const stringToHash = `${merchantKey}|${txnid}|${amount}|${status}|${merchantSalt}`;
    
    // Convert to SHA512
    const encoder = new TextEncoder();
    const data = encoder.encode(stringToHash);
    return receivedHash === hashString(data);
    
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
}

// Helper to hash string to SHA512
async function hashString(data: Uint8Array): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-512', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
}

// Add scans to user account based on payment amount
async function addScansToUser(userId: string, amount: number, txnId: string): Promise<boolean> {
  try {
    // Determine number of scans based on package
    const scansToAdd = determineScansFromAmount(amount);
    
    if (scansToAdd <= 0) {
      console.error('Invalid scan amount calculated:', scansToAdd);
      return false;
    }
    
    // Call RPC function to add scans - this encapsulates the DB transaction
    const { data, error } = await supabaseAdmin.rpc('add_scan_quota', {
      p_user_id: userId,
      p_amount: scansToAdd,
      p_type: 'purchase',
      p_reference: txnId
    });
    
    if (error) {
      console.error('Error adding scans:', error);
      return false;
    }
    
    console.log(`Successfully added ${scansToAdd} scans to user ${userId}`);
    return true;
    
  } catch (error) {
    console.error('Error in addScansToUser:', error);
    return false;
  }
}

// Determine scans based on payment amount
// This should match your subscription packages
function determineScansFromAmount(amount: number): number {
  // Example mapping of amount to scan packages
  // Adjust based on your actual pricing tiers
  if (amount >= 999) return 100;  // ₹999 package
  if (amount >= 499) return 40;   // ₹499 package
  if (amount >= 299) return 20;   // ₹299 package
  if (amount >= 99) return 5;     // ₹99 package
  return 0; // Unknown package
}

// Find user by their email
async function findUserByEmail(email: string): Promise<string | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .select('id')
      .eq('email', email)
      .single();
    
    if (error || !data) {
      console.error('Error finding user by email:', error);
      return null;
    }
    
    return data.id;
  } catch (error) {
    console.error('Error in findUserByEmail:', error);
    return null;
  }
}

// Main webhook handler
Deno.serve(async (req) => {
  // Allow CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });
  }
  
  try {
    // We expect PayU to send payment data as form data or JSON
    let payload;
    const contentType = req.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      payload = await req.json();
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await req.formData();
      payload = Object.fromEntries(formData.entries());
    } else {
      return new Response(
        JSON.stringify({ success: false, message: 'Unsupported content type' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('PayU webhook received:', JSON.stringify(payload));
    
    // Extract important fields
    const { txnid, amount, status, email, hash } = payload;
    
    // Verify signature
    if (!verifyPayUSignature(payload, hash)) {
      console.error('PayU signature verification failed');
      return new Response(
        JSON.stringify({ success: false, message: 'Signature verification failed' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Handle different payment statuses
    if (status === 'success') {
      // Find user by email
      const userId = await findUserByEmail(email);
      
      if (!userId) {
        console.error('User not found for email:', email);
        return new Response(
          JSON.stringify({ success: false, message: 'User not found' }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }
      
      // Add scans to user account
      const added = await addScansToUser(userId, parseFloat(amount), txnid);
      
      if (!added) {
        return new Response(
          JSON.stringify({ success: false, message: 'Failed to add scans' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
      
      // Payment processed successfully
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Payment processed successfully',
          txnid,
          status
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
      
    } else if (status === 'failure') {
      // Log payment failure
      console.log(`Payment failed for transaction ${txnid}`);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Payment failure recorded',
          txnid,
          status
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
      
    } else if (status === 'pending') {
      // Log pending payment
      console.log(`Payment pending for transaction ${txnid}`);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Pending payment recorded',
          txnid,
          status 
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
      
    } else {
      // Unknown status
      console.log(`Unknown payment status: ${status} for transaction ${txnid}`);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Unknown payment status recorded',
          txnid,
          status
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }
    
  } catch (error) {
    console.error('Error processing webhook:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Internal server error',
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/payu-webhook' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
