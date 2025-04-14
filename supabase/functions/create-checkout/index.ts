
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = "https://mcoeiucylazrjvhaemmc.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY") || "sk_test_51RDoMPFMjb3SJCYouSPsQdL3jQ6zmMSwO46mBwP9uRElZlpMGUf43b7Wz92VvJmxWh7tfPnNQAsdftr75UtrunVr001aTJ6o8J";
const PRICE_ID = "price_1RDoYDFMjb3SJCYocFbAuMHQ";

// Helper logging function
const log = (message: string, data?: any) => {
  console.log(`[CREATE-CHECKOUT] ${message}${data ? ` - ${JSON.stringify(data)}` : ""}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    log("Handling OPTIONS request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    log("Function started");
    
    // Check if required environment variables are set
    if (!STRIPE_SECRET_KEY) {
      log("ERROR: STRIPE_SECRET_KEY is not set");
      return new Response(JSON.stringify({ error: "Server configuration error: Missing Stripe key" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }
    
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      log("ERROR: No authorization header");
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const token = authHeader.replace("Bearer ", "");
    log("Token extracted", { tokenLength: token.length });
    
    // Initialize Supabase client
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false }
    });
    log("Supabase client initialized");
    
    // Get user from token
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError) {
      log("ERROR: User authentication failed", { error: userError.message });
      return new Response(JSON.stringify({ error: `Authentication failed: ${userError.message}` }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }
    
    if (!userData?.user) {
      log("ERROR: No user found");
      return new Response(JSON.stringify({ error: "User not found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }
    
    const user = userData.user;
    log("User authenticated", { id: user.id, email: user.email });
    
    try {
      // Initialize Stripe with verbose error logging
      log("Initializing Stripe with key", { keyLength: STRIPE_SECRET_KEY.length });
      const stripe = new Stripe(STRIPE_SECRET_KEY, { 
        apiVersion: "2023-10-16"
      });
      
      // Log successfully initialized Stripe
      log("Stripe initialized successfully");
      
      // Check for existing customer
      log("Checking for existing Stripe customer");
      const { data: subscribers, error: subscribersError } = await supabaseClient
        .from("subscribers")
        .select("stripe_customer_id")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (subscribersError) {
        log("WARNING: Error fetching subscriber", { error: subscribersError.message });
        // Continue anyway, we'll create or look up customer
      }
      
      let customerId: string | undefined;
      
      if (subscribers?.stripe_customer_id) {
        customerId = subscribers.stripe_customer_id;
        log("Using existing customer ID", { customerId });
      } else {
        // Look for customer by email or create new
        try {
          log("Looking up customer by email", { email: user.email });
          const customers = await stripe.customers.list({ email: user.email, limit: 1 });
          
          if (customers.data.length > 0) {
            customerId = customers.data[0].id;
            log("Found customer by email", { customerId });
            
            // Update database with customer ID
            await supabaseClient
              .from("subscribers")
              .upsert({ 
                user_id: user.id,
                email: user.email,
                stripe_customer_id: customerId,
                updated_at: new Date().toISOString()
              }, { onConflict: 'user_id' });
              
          } else {
            // Create new customer
            log("Creating new customer");
            const customer = await stripe.customers.create({
              email: user.email,
              name: user.user_metadata?.name || user.email,
            });
            
            customerId = customer.id;
            log("Created new customer", { customerId });
            
            // Save customer ID to database
            await supabaseClient
              .from("subscribers")
              .upsert({ 
                user_id: user.id,
                email: user.email,
                stripe_customer_id: customerId,
                updated_at: new Date().toISOString()
              }, { onConflict: 'user_id' });
          }
        } catch (stripeError: any) {
          log("ERROR: Customer lookup/creation failed", { 
            error: stripeError.message,
            type: stripeError.type,
            code: stripeError.code
          });
          return new Response(JSON.stringify({ 
            error: `Payment processing error: ${stripeError.message}` 
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
          });
        }
      }
      
      // Create checkout session with the specified price
      log("Creating checkout session", { priceId: PRICE_ID, customerId });
      
      try {
        const origin = req.headers.get("origin") || "http://localhost:5173";
        log("Using origin for redirect", { origin });
        
        const session = await stripe.checkout.sessions.create({
          customer: customerId,
          line_items: [{ price: PRICE_ID, quantity: 1 }],
          mode: "subscription",
          success_url: `${origin}/dashboard?success=true`,
          cancel_url: `${origin}/dashboard?canceled=true`,
        });
        
        log("Checkout session created successfully", { 
          sessionId: session.id,
          url: session.url
        });
        
        return new Response(JSON.stringify({ url: session.url }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      } catch (stripeError: any) {
        log("ERROR: Creating checkout session failed", { 
          error: stripeError.message,
          type: stripeError.type,
          code: stripeError.code
        });
        return new Response(JSON.stringify({ 
          error: `Failed to create checkout: ${stripeError.message}` 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        });
      }
    } catch (stripeInitError: any) {
      log("ERROR: Stripe initialization failed", { error: stripeInitError.message });
      return new Response(JSON.stringify({ 
        error: `Payment service error: ${stripeInitError.message}` 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log("ERROR: Unhandled exception", { error: errorMessage });
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
