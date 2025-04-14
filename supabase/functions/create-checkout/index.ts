
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
const PRICE_ID = "price_1RDoYDFMjb3SJCYocFbAuMHQ";

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

    // Log all environment variables for debugging (without values for security)
    logStep("Environment variables check", {
      STRIPE_SECRET_KEY_SET: !!STRIPE_SECRET_KEY,
      SUPABASE_SERVICE_ROLE_KEY_SET: !!SUPABASE_SERVICE_ROLE_KEY,
      SUPABASE_URL_SET: !!SUPABASE_URL
    });

    if (!STRIPE_SECRET_KEY) {
      logStep("ERROR: STRIPE_SECRET_KEY is not set");
      return new Response(JSON.stringify({ error: "STRIPE_SECRET_KEY is not set" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }
    
    if (!SUPABASE_SERVICE_ROLE_KEY) {
      logStep("ERROR: SUPABASE_SERVICE_ROLE_KEY is not set");
      return new Response(JSON.stringify({ error: "SUPABASE_SERVICE_ROLE_KEY is not set" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }
    
    logStep("Environment variables verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      logStep("ERROR: No authorization header provided");
      return new Response(JSON.stringify({ error: "No authorization header provided" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const token = authHeader.replace("Bearer ", "");
    logStep("Token extracted from header");
    
    // Create Supabase client
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false }
    });
    
    // Verify user
    logStep("Verifying user with token");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError) {
      logStep(`ERROR: Authentication error: ${userError.message}`);
      return new Response(JSON.stringify({ error: `Authentication error: ${userError.message}` }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }
    
    if (!userData?.user) {
      logStep("ERROR: User data not found");
      return new Response(JSON.stringify({ error: "User not found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }
    
    const user = userData.user;
    if (!user?.email) {
      logStep("ERROR: User email not available");
      return new Response(JSON.stringify({ error: "User not authenticated or email not available" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }
    
    logStep("Creating checkout for user:", { email: user.email, userId: user.id });
    
    try {
      // Initialize Stripe
      const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" });
      logStep("Stripe initialized successfully");
      
      // Check if user already has a Stripe customer ID
      const { data: subscribers, error: subscribersError } = await supabaseClient
        .from("subscribers")
        .select("stripe_customer_id")
        .eq("user_id", user.id)
        .single();
        
      if (subscribersError && subscribersError.code !== "PGRST116") {
        logStep(`ERROR: Error fetching subscriber: ${subscribersError.message}`);
        return new Response(JSON.stringify({ error: `Error fetching subscriber: ${subscribersError.message}` }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        });
      }
      
      let customerId: string | undefined;
      
      if (subscribers?.stripe_customer_id) {
        customerId = subscribers.stripe_customer_id;
        logStep("Using existing Stripe customer:", { customerId });
      } else {
        // If no customer ID found, look up by email or create new customer
        try {
          const customers = await stripe.customers.list({ email: user.email, limit: 1 });
          logStep("Stripe customer lookup successful");
          
          if (customers.data.length > 0) {
            customerId = customers.data[0].id;
            logStep("Found Stripe customer by email:", { customerId });
            
            // Update the subscriber record with the customer ID
            const { error: upsertError } = await supabaseClient
              .from("subscribers")
              .upsert({ 
                user_id: user.id,
                email: user.email,
                stripe_customer_id: customerId,
                updated_at: new Date().toISOString()
              }, { onConflict: 'user_id' });
              
            if (upsertError) {
              logStep(`WARNING: Error updating subscriber: ${upsertError.message}`);
              // Continue anyway, this is not critical
            }
          } else {
            // Create a new customer
            logStep("Creating new Stripe customer");
            try {
              const newCustomer = await stripe.customers.create({
                email: user.email,
                name: user.user_metadata?.name || user.email,
              });
              customerId = newCustomer.id;
              logStep("Created new Stripe customer:", { customerId });
              
              // Insert new subscriber record
              const { error: insertError } = await supabaseClient
                .from("subscribers")
                .upsert({ 
                  user_id: user.id,
                  email: user.email,
                  stripe_customer_id: customerId,
                  subscription_tier: "free",
                  subscribed: false,
                  updated_at: new Date().toISOString()
                }, { onConflict: 'user_id' });
                
              if (insertError) {
                logStep(`WARNING: Error inserting subscriber: ${insertError.message}`);
                // Continue anyway, this is not critical
              }
            } catch (stripeError: any) {
              logStep(`ERROR: Failed to create Stripe customer: ${stripeError.message}`);
              return new Response(JSON.stringify({ error: `Failed to create Stripe customer: ${stripeError.message}` }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 500,
              });
            }
          }
        } catch (stripeError: any) {
          logStep(`ERROR: Failed to list Stripe customers: ${stripeError.message}`);
          return new Response(JSON.stringify({ error: `Failed to list Stripe customers: ${stripeError.message}` }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
          });
        }
      }
      
      // Create checkout session with the specific price ID
      logStep("Creating checkout session with price ID:", { priceId: PRICE_ID });
      try {
        const session = await stripe.checkout.sessions.create({
          customer: customerId,
          line_items: [
            {
              price: PRICE_ID,
              quantity: 1,
            },
          ],
          mode: "subscription",
          success_url: `${req.headers.get("origin")}/dashboard?success=true`,
          cancel_url: `${req.headers.get("origin")}/dashboard?canceled=true`,
        });
        
        logStep("Checkout session created successfully", { sessionId: session.id, url: session.url });
        
        return new Response(JSON.stringify({ url: session.url }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      } catch (stripeError: any) {
        logStep(`ERROR: Failed to create checkout session: ${stripeError.message}`);
        return new Response(JSON.stringify({ error: `Failed to create checkout session: ${stripeError.message}` }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        });
      }
    } catch (stripeError: any) {
      logStep(`ERROR: Stripe initialization error: ${stripeError.message}`);
      return new Response(JSON.stringify({ error: `Stripe initialization error: ${stripeError.message}` }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep(`ERROR: Unexpected error: ${errorMessage}`);
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
