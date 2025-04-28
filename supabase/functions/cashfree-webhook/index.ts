/// <reference types="deno" />
import { serve } from "https://deno.land/std@0.181.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
serve(async (req) => {
  const body = await req.json();
  if (body.event === "PAYMENT_SUCCESS") {
    const userId = body.data.customer_details.customer_id;
    const txnId = body.data.payment.payment_id;
    const amount = body.data.payment.payment_amount;
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const { error } = await supabaseAdmin.rpc("add_scans_after_payment", {
      user_id: userId,
      scans_to_add: 5,
      txn_id: txnId,
      amount: amount,
    });
    if (error) {
      return new Response(JSON.stringify({ error }), { status: 500 });
    }
  }
  return new Response("OK", { status: 200 });
});