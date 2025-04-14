
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = "https://mcoeiucylazrjvhaemmc.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY") || "";

// Helper logging function
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    if (!STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    const token = authHeader.replace("Bearer ", "");
    
    // Create Supabase client
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false }
    });
    
    // Verify user
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) {
      throw new Error(`Authentication error: ${userError.message}`);
    }
    
    const user = userData.user;
    if (!user?.email) {
      throw new Error("User not authenticated or email not available");
    }
    
    logStep("Creating checkout for user:", { email: user.email, userId: user.id });
    
    // Initialize Stripe
    const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" });
    
    // Check if user already has a Stripe customer ID
    const { data: subscribers, error: subscribersError } = await supabaseClient
      .from("subscribers")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single();
      
    if (subscribersError && subscribersError.code !== "PGRST116") {
      throw new Error(`Error fetching subscriber: ${subscribersError.message}`);
    }
    
    let customerId: string | undefined;
    
    if (subscribers?.stripe_customer_id) {
      customerId = subscribers.stripe_customer_id;
      logStep("Using existing Stripe customer:", { customerId });
    } else {
      // If no customer ID found, look up by email or create new customer
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        logStep("Found Stripe customer by email:", { customerId });
        
        // Update the subscriber record with the customer ID
        await supabaseClient
          .from("subscribers")
          .upsert({ 
            user_id: user.id,
            email: user.email,
            stripe_customer_id: customerId,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' });
      } else {
        // Create a new customer
        const newCustomer = await stripe.customers.create({
          email: user.email,
          name: user.user_metadata?.name || user.email,
        });
        customerId = newCustomer.id;
        logStep("Created new Stripe customer:", { customerId });
        
        // Insert new subscriber record
        await supabaseClient
          .from("subscribers")
          .upsert({ 
            user_id: user.id,
            email: user.email,
            stripe_customer_id: customerId,
            subscription_tier: "free",
            subscribed: false,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' });
      }
    }
    
    // Create checkout session with the specific price ID
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: 'price_1RDogOFZLNoNkWEexA6EV70N', // Using the specific price ID
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/dashboard?success=true`,
      cancel_url: `${req.headers.get("origin")}/dashboard?canceled=true`,
    });
    
    logStep("Checkout session created", { sessionId: session.id, url: session.url });
    
    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error in create-checkout:", errorMessage);
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
