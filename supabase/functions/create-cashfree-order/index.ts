/// <reference types="deno" />
import { serve } from "https://deno.land/std@0.181.0/http/server.ts";
serve(async (req) => {
  const { userId, amount = 99, email } = await req.json();
  const CASHFREE_APP_ID = Deno.env.get("CASHFREE_APP_ID")!;
  const CASHFREE_SECRET_KEY = Deno.env.get("CASHFREE_SECRET_KEY")!;
  const orderPayload = {
    order_id: `order_${userId}_${Date.now()}`,
    order_amount: amount,
    order_currency: "INR",
    customer_details: {
      customer_id: userId,
      customer_email: email,
    },
  };
  const response = await fetch("https://api.cashfree.com/pg/orders", {
    method: "POST",
    headers: {
      "x-client-id": CASHFREE_APP_ID,
      "x-secret-key": CASHFREE_SECRET_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(orderPayload),
  });
  const data = await response.json();
  if (!response.ok) {
    return new Response(JSON.stringify({ error: data }), { status: 500 });
  }
  return new Response(JSON.stringify(data), { status: 200 });
});