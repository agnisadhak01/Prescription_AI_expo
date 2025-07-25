// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Define CORS headers for consistent use
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

// Constants for scan quota plans
const SCAN_QUOTA_PLANS = {
  "49": 1,     // 49 INR = 1 scan (Single Scan)
  "199": 5,    // 199 INR = 5 scans (Individual Premium)
  "299": 10,   // 299 INR = 10 scans (Family Plan)
  "999": 50    // 999 INR = 50 scans (Healthcare Service Provider)
};

// Minimum number of scans to add for any successful payment
const MIN_SCAN_QUOTA = 1;

// Helper function to create Supabase client
function createSupabaseClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
}

// PayU webhook handler
Deno.serve(async (req) => {
  // Handle preflight CORS requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  // For health checks
  if (req.method === 'GET') {
    return new Response(
      JSON.stringify({
        success: true,
        message: 'PayU webhook is operational',
        timestamp: new Date().toISOString()
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  // Process PayU payment notification
  if (req.method === 'POST') {
    try {
      // Read request body
      const body = await req.text();
      console.log('Request body:', body);
      
      let payload: Record<string, string> = {};
      
      // Try to parse as JSON first
      try {
        payload = JSON.parse(body);
        console.log('Successfully parsed JSON payload');
      } catch (e) {
        // If JSON parse fails, try URL form encoded format
        console.log('Not valid JSON, trying form-urlencoded format');
        try {
          const params = new URLSearchParams(body);
          params.forEach((value, key) => {
            payload[key] = value;
          });
          
          if (Object.keys(payload).length === 0) {
            console.error('Failed to parse payload as form data');
            // Try once more with manual parsing for curl requests
            const fields = body.split('&');
            for (const field of fields) {
              const [key, value] = field.split('=');
              if (key && value) {
                // Extract the key from any quotes or braces
                const cleanKey = key.replace(/["{}]/g, '').trim();
                // Extract the value from any quotes
                const cleanValue = value.replace(/["{}]/g, '').trim();
                payload[cleanKey] = cleanValue;
              }
            }
          }
        } catch (formError) {
          console.error('Form parsing error:', formError);
        }
        
        // For curl testing from command line, the JSON might be escaped
        if (Object.keys(payload).length === 0) {
          try {
            // Try to parse if body contains escaped JSON
            if (body.includes('\\\"')) {
              const unescaped = body.replace(/\\"/g, '"');
              payload = JSON.parse(unescaped);
              console.log('Parsed unescaped JSON payload');
            } else if (body.startsWith('"') && body.endsWith('"')) {
              // If the body is a quoted string, try to parse the content
              const inner = body.substring(1, body.length - 1);
              payload = JSON.parse(inner);
              console.log('Parsed quoted JSON payload');
            }
          } catch (jsonError) {
            console.error('Escaped JSON parsing error:', jsonError);
          }
        }
        
        if (Object.keys(payload).length === 0) {
          console.error('Failed to parse payload with any method');
          return new Response(
            JSON.stringify({ success: false, message: 'Invalid payload format' }),
            { 
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }
      }
      
      console.log('Parsed payload:', payload);
      
      // Extract payment details
      const { txnid, amount, status, email, udf1 } = payload;
      
      if (!txnid || !amount) {
        console.error('Missing required payment fields');
        return new Response(
          JSON.stringify({ success: false, message: 'Missing required payment fields' }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      console.log('Payment details:', { txnid, amount, status, email });
      
      // For non-success payments, just acknowledge
      if (status !== 'success') {
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: `Payment status acknowledged: ${status}` 
          }),
          { 
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      // Process successful payment
      try {
        const supabase = createSupabaseClient();
        
        // Check for existing transaction
        const { data: existingTx, error: txError } = await supabase
          .from('scan_quota_transactions')
          .select('id, scan_quota, user_id')
          .eq('transaction_id', txnid)
          .maybeSingle();
        
        if (txError) {
          console.error('Error checking for existing transaction:', txError);
        }
        
        // Check if transaction exists and already has scan quota assigned
        if (existingTx && existingTx.scan_quota > 0) {
          console.log('Transaction already processed with scans:', txnid);
          return new Response(
            JSON.stringify({ 
              success: true, 
              message: 'Transaction already processed',
              scan_quota: existingTx.scan_quota
            }),
            { 
              status: 200,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }
        
        // If transaction exists but has 0 scan quota, we'll update it
        if (existingTx && existingTx.scan_quota === 0) {
          console.log('Transaction exists but has 0 scan quota, will update:', txnid);
          // Use existing user ID if available
          if (!userId && existingTx.user_id) {
            userId = existingTx.user_id;
            console.log('Using existing user ID from transaction:', userId);
          }
        }
        
        // Identify user
        let userId = udf1 || '';
        if (!userId && email) {
          // Clean up email address (decode, trim, lowercase)
          const cleanEmail = decodeURIComponent(email).trim().toLowerCase();
          console.log('Looking for user with email:', cleanEmail);
          
          // Try fetching from profiles first
          const { data: profileUser, error: profileError } = await supabase
            .from('profiles')
            .select('id')
            .ilike('email', cleanEmail)
            .maybeSingle();
          
          if (profileUser) {
            userId = profileUser.id;
            console.log('Found user ID from profiles table:', userId);
          } else if (profileError) {
            console.log('Error finding user in profiles:', profileError);
            
            // Try users table as fallback
            const { data: user, error: userError } = await supabase
              .from('users')
              .select('id')
              .ilike('email', cleanEmail)
              .maybeSingle();
              
            if (user) {
              userId = user.id;
              console.log('Found user ID from users table:', userId);
            } else if (userError) {
              console.log('Error finding user in users table:', userError);
            }
          }
        }

        if (!userId) {
          console.log('Could not find user ID for email:', email);
        }
        
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
        
        // Record or update transaction in scan_quota_transactions table
        try {
          let txRecord;
          
          if (existingTx) {
            // Update existing transaction if it has 0 scan quota
            const { data: updateResult, error: updateError } = await supabase
              .from('scan_quota_transactions')
              .update({
                scan_quota: scanQuota,
                user_id: userId || existingTx.user_id,
                status: 'success'
              })
              .eq('id', existingTx.id)
              .select()
              .single();
              
            if (updateError) {
              console.error('Failed to update existing transaction:', updateError);
            } else {
              console.log('Updated transaction with scan quota:', scanQuota);
              txRecord = updateResult;
            }
          } else {
            // Insert new transaction record
            const { data: insertResult, error: txInsertError } = await supabase
              .from('scan_quota_transactions')
              .insert({
                transaction_id: txnid,
                amount: parseFloat(amount),
                status: 'success',
                user_id: userId || null,
                scan_quota: scanQuota,
                payment_details: payload
              })
              .select()
              .single();
            
            if (txInsertError) {
              console.error('Failed to record transaction:', txInsertError);
            } else {
              console.log('Transaction recorded with ID:', insertResult.id);
              txRecord = insertResult;
            }
          }
        } catch (insertError) {
          console.error('Exception recording transaction:', insertError);
        }
        
        // Update user scan quota if we have a user ID and quota to add
        if (userId && scanQuota > 0) {
          try {
            // First, try using add_scan_quota function for transaction tracking
            console.log('Calling add_scan_quota with:', { 
              p_user_id: userId, 
              p_amount: scanQuota,
              p_type: 'purchase',
              p_reference: txnid
            });
            
            const { data: addQuotaResult, error: addQuotaError } = await supabase.rpc(
              'add_scan_quota',
              { 
                p_user_id: userId, 
                p_amount: scanQuota,
                p_type: 'purchase',
                p_reference: txnid
              }
            );
            
            if (addQuotaError) {
              console.error('Error using add_scan_quota:', addQuotaError);
              
              // Fallback to direct update_user_quota
              console.log('Falling back to update_user_quota');
              const { data: updateResult, error: updateError } = await supabase.rpc(
                'update_user_quota',
                { 
                  user_id_param: userId, 
                  scans_to_add: scanQuota
                }
              );
              
              if (updateError) {
                console.error('Error using update_user_quota:', updateError);
                
                // Last resort: direct table update
                console.log('Attempting direct table update as last resort');
                try {
                  // Try users table
                  const { error: userUpdateError } = await supabase
                    .from('users')
                    .update({ 
                      scans_remaining: supabase.sql`scans_remaining + ${scanQuota}`,
                      updated_at: new Date().toISOString()
                    })
                    .eq('id', userId);
                  
                  if (userUpdateError) {
                    console.error('Failed to update users table:', userUpdateError);
                  }
                  
                  // Try profiles table
                  const { error: profileUpdateError } = await supabase
                    .from('profiles')
                    .update({ 
                      scans_remaining: supabase.sql`scans_remaining + ${scanQuota}`,
                      updated_at: new Date().toISOString()
                    })
                    .eq('id', userId);
                  
                  if (profileUpdateError) {
                    console.error('Failed to update profiles table:', profileUpdateError);
                  }
                } catch (directUpdateError) {
                  console.error('Exception in direct table update:', directUpdateError);
                  throw updateError;
                }
              } else {
                console.log('Successfully updated quota with update_user_quota');
              }
            } else {
              console.log('Successfully updated quota with add_scan_quota');
            }
            
            console.log('Updated scan quota for user', userId, 'with', scanQuota, 'scans');
          } catch (quotaError) {
            console.error('Failed to update quota:', quotaError);
            // Continue with the webhook response even if quota update fails
            // The transaction is recorded, so we can manually fix quota later if needed
          }
        }
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Payment processed successfully',
            txnid,
            scans_added: scanQuota
          }),
          { 
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      } catch (dbError) {
        console.error('Database error:', dbError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: 'Error processing payment'
          }),
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    } catch (error) {
      console.error('Webhook error:', error);
      return new Response(
        JSON.stringify({ success: false, message: 'Webhook error' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
  }
  
  // For any other HTTP method
  return new Response(
    JSON.stringify({ success: false, message: 'Method not allowed' }),
    { 
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
});
