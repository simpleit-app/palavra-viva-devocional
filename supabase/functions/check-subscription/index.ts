
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

// Helper logging function for enhanced debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    if (!STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    logStep("Authenticating user with token");
    
    // Use the service role key to perform writes (upsert) in Supabase
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false }
    });
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" });
    
    // Check if this is the special user that should always be Pro
    const isSpecialUser = user.email === "simpleit.solucoes@gmail.com";
    logStep("Checking if special user", { isSpecialUser, email: user.email });
    
    // Get the user's subscriber record
    const { data: subscriber, error: subscriberError } = await supabaseClient
      .from("subscribers")
      .select("*")
      .eq("user_id", user.id)
      .single();
      
    if (subscriberError && subscriberError.code !== "PGRST116") {
      throw new Error(`Error fetching subscriber: ${subscriberError.message}`);
    }
    
    logStep("Current subscriber data", subscriber);
    
    // If no subscriber record, create one
    if (!subscriber) {
      logStep("No subscriber found, creating record");
      
      // If it's the special user, make them Pro by default
      if (isSpecialUser) {
        logStep("Creating Pro subscription for special user");
        await supabaseClient.from("subscribers").insert({
          user_id: user.id,
          email: user.email,
          subscription_tier: "pro",
          subscribed: true,
          subscription_end: new Date(2099, 11, 31).toISOString(),
          updated_at: new Date().toISOString()
        });
        
        return new Response(JSON.stringify({ 
          subscribed: true,
          subscription_tier: "pro",
          subscription_end: new Date(2099, 11, 31).toISOString()
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
      
      await supabaseClient.from("subscribers").insert({
        user_id: user.id,
        email: user.email,
        subscription_tier: "free",
        subscribed: false,
        updated_at: new Date().toISOString()
      });
      
      return new Response(JSON.stringify({ 
        subscribed: false,
        subscription_tier: "free",
        subscription_end: null
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    
    // Special case: If it's our special user, ALWAYS ensure they have Pro status
    if (isSpecialUser) {
      logStep("Special user found, ensuring Pro status");
      
      // Always update to Pro if it's the special user
      await supabaseClient
        .from("subscribers")
        .update({
          subscription_tier: "pro",
          subscribed: true,
          subscription_end: new Date(2099, 11, 31).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);
      
      logStep("Updated special user to Pro status");
      return new Response(JSON.stringify({ 
        subscribed: true,
        subscription_tier: "pro",
        subscription_end: new Date(2099, 11, 31).toISOString()
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    
    // For non-special users, proceed with normal Stripe checking
    // If the subscriber has no Stripe customer ID, check if they have one
    if (!subscriber.stripe_customer_id) {
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      
      if (customers.data.length === 0) {
        logStep("No customer found, updating as free tier");
        
        await supabaseClient
          .from("subscribers")
          .update({
            subscription_tier: "free",
            subscribed: false,
            updated_at: new Date().toISOString()
          })
          .eq("user_id", user.id);
          
        return new Response(JSON.stringify({ 
          subscribed: false,
          subscription_tier: "free",
          subscription_end: null
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
      
      const customerId = customers.data[0].id;
      logStep("Found Stripe customer by email:", { customerId });
      
      await supabaseClient
        .from("subscribers")
        .update({ 
          stripe_customer_id: customerId,
          updated_at: new Date().toISOString()
        })
        .eq("user_id", user.id);
        
      subscriber.stripe_customer_id = customerId;
    }

    const customerId = subscriber.stripe_customer_id;
    logStep("Checking subscriptions for customer", { customerId });

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });
    
    const hasActiveSub = subscriptions.data.length > 0;
    let subscriptionTier = "free";
    let subscriptionEnd = null;

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      subscriptionTier = "pro";
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      logStep("Active subscription found", { 
        subscriptionId: subscription.id, 
        endDate: subscriptionEnd,
        tier: subscriptionTier 
      });
    } else {
      logStep("No active subscription found");
    }

    await supabaseClient
      .from("subscribers")
      .update({
        subscribed: subscriptionTier === "pro",
        subscription_tier: subscriptionTier,
        subscription_end: subscriptionEnd,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    logStep("Updated database with subscription info", { subscribed: subscriptionTier === "pro", subscriptionTier });
    
    return new Response(JSON.stringify({
      subscribed: subscriptionTier === "pro",
      subscription_tier: subscriptionTier,
      subscription_end: subscriptionEnd
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage });
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
