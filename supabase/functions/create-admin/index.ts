import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = "https://mcoeiucylazrjvhaemmc.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const ADMIN_EMAIL = "admin@palavraviva.com";
const ADMIN_PASSWORD = "admin@213";

// Helper logging function
const log = (message: string, data?: any) => {
  console.log(`[CREATE-ADMIN] ${message}${data ? ` - ${JSON.stringify(data)}` : ""}`);
};

// Immediately invoke the function to create the admin user when deployed
(async () => {
  try {
    log("Auto-creating admin user on deployment");
    
    // Check if service role key is set
    if (!SUPABASE_SERVICE_ROLE_KEY) {
      log("ERROR: SUPABASE_SERVICE_ROLE_KEY is not set");
      return;
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
    
    // Step 1: Check if admin user already exists in auth.users
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserByEmail(ADMIN_EMAIL);
    
    let userId;
    
    if (authError && authError.message !== 'User not found') {
      log("ERROR: Failed to check for existing admin user", { error: authError.message });
      return;
    }
    
    // Step 2: Create admin user if it doesn't exist
    if (!authUser?.user) {
      log("Admin user doesn't exist, creating new user");
      const { data: newUserData, error: createError } = await supabaseAdmin.auth.admin.createUser({
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
        return;
      }
      
      userId = newUserData.user.id;
      log("Admin user created successfully", { id: userId });
    } else {
      userId = authUser.user.id;
      log("Admin user already exists", { id: userId });
    }
    
    // Step 3: Check if a profile exists for the admin user
    const { data: existingProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
      
    if (profileError) {
      log("ERROR: Failed to check for existing profile", { error: profileError.message });
      // Continue anyway, we'll try to create the profile
    }
    
    // Step 4: Create a profile for the admin user if it doesn't exist
    if (!existingProfile) {
      log("Creating profile for admin user");
      const { error: createProfileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: userId,
          name: "Administrator",
          email: ADMIN_EMAIL,
          photo_url: `https://i.pravatar.cc/150?u=${ADMIN_EMAIL}`,
          level: 100,
          total_reflections: 0,
          chapters_read: 0,
          consecutive_days: 0,
          created_at: new Date().toISOString(),
          last_access: new Date().toISOString()
        });
        
      if (createProfileError) {
        log("WARNING: Failed to create profile", { error: createProfileError.message });
        // Continue anyway, as we want to ensure the subscriber record is created
      } else {
        log("Admin profile created successfully");
      }
    } else {
      log("Admin profile already exists");
    }
    
    // Step 5: Make sure the admin is in the subscribers table with Pro access
    const { data: existingSubscriber, error: subscriberError } = await supabaseAdmin
      .from('subscribers')
      .select('*')
      .eq('email', ADMIN_EMAIL)
      .maybeSingle();
      
    if (subscriberError) {
      log("ERROR: Failed to check for existing subscriber", { error: subscriberError.message });
      // Continue anyway, we'll try to create/update the subscriber
    }
    
    // Step 6: Create or update the subscriber record for the admin
    const subscriberData = {
      email: ADMIN_EMAIL,
      user_id: userId,
      subscribed: true,
      subscription_tier: 'pro',
      subscription_end: new Date(2099, 11, 31).toISOString(), // Far future date
      updated_at: new Date().toISOString()
    };
    
    const { error: upsertError } = await supabaseAdmin
      .from('subscribers')
      .upsert(subscriberData, { onConflict: 'email' });
      
    if (upsertError) {
      log("ERROR: Failed to create/update subscriber", { error: upsertError.message });
      return;
    }
    
    log("Admin subscriber record created/updated successfully", { tier: 'pro' });
    
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log("ERROR: Unhandled exception", { error: errorMessage });
  }
})();

// Keep the serve handler for API usage if needed
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    log("Handling OPTIONS request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    log("Function handler called");
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: "Admin user creation endpoint active. Note: Admin user is also auto-created on deployment."
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
    
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log("ERROR: Unhandled exception in handler", { error: errorMessage });
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
