
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = "https://mcoeiucylazrjvhaemmc.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const ADMIN_EMAIL = "admin@palavraviva.com";
const ADMIN_PASSWORD = "admin@123"; // Updated password

// Helper logging function
const log = (message: string, data?: any) => {
  console.log(`[CREATE-ADMIN] ${message}${data ? ` - ${JSON.stringify(data)}` : ""}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    log("Handling OPTIONS request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    log("Function started");
    
    // Check if service role key is set
    if (!SUPABASE_SERVICE_ROLE_KEY) {
      log("ERROR: SUPABASE_SERVICE_ROLE_KEY is not set");
      return new Response(JSON.stringify({ error: "Server configuration error: Missing Supabase service role key" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }
    
    // Initialize Supabase admin client with service role
    const supabaseAdmin = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: { persistSession: false }
      }
    );
    log("Supabase admin client initialized");
    
    // Check if admin user already exists
    const { data: existingUsers, error: listError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('email', ADMIN_EMAIL)
      .maybeSingle();
    
    if (listError) {
      log("ERROR: Failed to check for existing admin", { error: listError.message });
      return new Response(JSON.stringify({ error: `Database error: ${listError.message}` }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }
    
    if (existingUsers) {
      log("Admin user already exists", { id: existingUsers.id });
      return new Response(JSON.stringify({ message: "Admin user already exists", id: existingUsers.id }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    
    // Create admin user with auth.admin
    const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: { 
        name: "Administrator",
        role: "admin"
      }
    });
    
    if (createError) {
      log("ERROR: Failed to create admin user", { error: createError.message });
      return new Response(JSON.stringify({ error: `Auth error: ${createError.message}` }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }
    
    log("Admin user created successfully", { id: authData.user.id });
    
    // Set user as admin in subscribers table (give full subscription access)
    const { error: subscriberError } = await supabaseAdmin
      .from('subscribers')
      .upsert({
        user_id: authData.user.id,
        email: ADMIN_EMAIL,
        subscribed: true,
        subscription_tier: 'pro',
        subscription_end: new Date(2099, 11, 31).toISOString(), // Far future date
        updated_at: new Date().toISOString()
      }, { onConflict: 'email' });
    
    if (subscriberError) {
      log("WARNING: Failed to set subscription status", { error: subscriberError.message });
      // Continue anyway, as the main admin user was created
    } else {
      log("Admin subscription status set", { tier: 'pro' });
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: "Admin user created successfully",
      user: {
        id: authData.user.id,
        email: ADMIN_EMAIL,
        name: "Administrator",
        role: "admin"
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
    
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log("ERROR: Unhandled exception", { error: errorMessage });
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
