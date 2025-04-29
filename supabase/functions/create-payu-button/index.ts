// This function initializes payments with PayU and requires no JWT verification
// Follow Deno runtime types for Supabase Edge Functions
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import * as crypto from "https://deno.land/std@0.177.0/crypto/mod.ts";

interface PayURequest {
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
  phone?: string;
  udf1?: string; // Can be used for user_id
  udf2?: string; // Can be used for scan_count
  udf5?: string; // Can be used for payment_plan
}

// Function to create SHA-512 hash
async function hashString(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-512", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

serve(async (req: Request) => {
  // Enable CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  // Only allow POST method
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  try {
    const { data } = await req.json() as { data: PayURequest };
    
    // Get environment variables
    const PAYU_MERCHANT_KEY = Deno.env.get("PAYU_MERCHANT_KEY") || "";
    const PAYU_SALT = Deno.env.get("PAYU_SALT") || "";
    const PAYU_TEST_MODE = Deno.env.get("PAYU_TEST_MODE") === "true";
    
    if (!PAYU_MERCHANT_KEY || !PAYU_SALT) {
      console.error("Missing PayU credentials in environment variables");
      return new Response(
        JSON.stringify({ error: "Payment gateway configuration error" }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Create transaction ID (unique for each payment)
    const txnId = `TXN_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    
    // Set up PayU parameters
    const paymentParams = {
      key: PAYU_MERCHANT_KEY,
      txnid: txnId,
      amount: data.amount,
      productinfo: data.productinfo,
      firstname: data.firstname,
      email: data.email,
      phone: data.phone || "",
      surl: Deno.env.get("PUBLIC_FRONTEND_URL") || "https://prescriptionsaathi.in/payment-success",
      furl: Deno.env.get("PUBLIC_FRONTEND_URL") || "https://prescriptionsaathi.in/payment-failure",
      udf1: data.udf1 || "", // user_id
      udf2: data.udf2 || "", // scan_count
      udf5: data.udf5 || "", // payment_plan
    };

    // Create hash string - the order is important!
    const hashString = `${PAYU_MERCHANT_KEY}|${paymentParams.txnid}|${paymentParams.amount}|${paymentParams.productinfo}|${paymentParams.firstname}|${paymentParams.email}|${paymentParams.udf1}|${paymentParams.udf2}||${paymentParams.udf5}||||||${PAYU_SALT}`;
    
    // Log the hash string for debugging
    console.log("Hash string for PayU:", hashString);
    
    // Generate SHA-512 hash
    const hash = await hashString(hashString);
    console.log("Generated hash:", hash);

    // Determine PayU endpoint based on test mode
    const payuUrl = PAYU_TEST_MODE
      ? "https://test.payu.in/_payment"
      : "https://secure.payu.in/_payment";

    // Create HTML form for PayU redirect
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Redirecting to PayU</title>
        </head>
        <body>
          <form id="payuForm" action="${payuUrl}" method="post">
            <input type="hidden" name="key" value="${paymentParams.key}" />
            <input type="hidden" name="txnid" value="${paymentParams.txnid}" />
            <input type="hidden" name="amount" value="${paymentParams.amount}" />
            <input type="hidden" name="productinfo" value="${paymentParams.productinfo}" />
            <input type="hidden" name="firstname" value="${paymentParams.firstname}" />
            <input type="hidden" name="email" value="${paymentParams.email}" />
            <input type="hidden" name="phone" value="${paymentParams.phone}" />
            <input type="hidden" name="surl" value="${paymentParams.surl}" />
            <input type="hidden" name="furl" value="${paymentParams.furl}" />
            <input type="hidden" name="hash" value="${hash}" />
            <input type="hidden" name="udf1" value="${paymentParams.udf1}" />
            <input type="hidden" name="udf2" value="${paymentParams.udf2}" />
            <input type="hidden" name="udf5" value="${paymentParams.udf5}" />
          </form>
          <script type="text/javascript">
            document.getElementById("payuForm").submit();
          </script>
        </body>
      </html>
    `;

    // Try to save transaction to database
    try {
      // Create Supabase client
      const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
      
      if (supabaseUrl && supabaseServiceKey) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        
        // Save transaction details
        await supabase
          .from('payment_transactions')
          .insert({
            transaction_id: paymentParams.txnid,
            user_id: data.udf1, 
            amount: paymentParams.amount,
            payment_status: 'initiated',
            product_info: paymentParams.productinfo,
            scan_count: data.udf2 ? parseInt(data.udf2) : null,
            payment_plan: data.udf5 || null
          });
      }
    } catch (dbError) {
      // Log database error but continue with payment
      console.error("Error saving to database:", dbError);
    }

    // Return HTML form that auto-submits to PayU
    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Error in payment initiation:", error);
    return new Response(
      JSON.stringify({ error: "Payment initiation failed", details: error.message }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
}); 