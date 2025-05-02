
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Create a Supabase client with the Auth context of the logged in user
  const supabaseClient = createClient(
    // Supabase API URL - env var exported by default.
    Deno.env.get("SUPABASE_URL") ?? "",
    // Supabase API ANON KEY - env var exported by default.
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
  );

  try {
    console.log("Fetching public statistics...");
    
    // Get active subscribers count
    const { count: subscribersCount, error: subscribersError } = await supabaseClient
      .from('subscribers')
      .select('*', { count: 'exact', head: true })
      .eq('subscribed', true);
    
    if (subscribersError) {
      throw subscribersError;
    }
    
    // Get total reflections count
    const { count: reflectionsCount, error: reflectionsError } = await supabaseClient
      .from('reflections')
      .select('*', { count: 'exact', head: true });
    
    if (reflectionsError) {
      throw reflectionsError;
    }
    
    // Get total read verses count
    const { count: versesReadCount, error: versesReadError } = await supabaseClient
      .from('read_verses')
      .select('*', { count: 'exact', head: true });
    
    if (versesReadError) {
      throw versesReadError;
    }
    
    // Get random testimonials
    const { data: testimonials, error: testimonialsError } = await supabaseClient
      .rpc('fetch_public_testimonials', { count_limit: 3 });
    
    if (testimonialsError) {
      throw testimonialsError;
    }
    
    const responseData = {
      activeSubscribersCount: subscribersCount || 0,
      reflectionsCount: reflectionsCount || 0,
      versesReadCount: versesReadCount || 0,
      testimonials: testimonials || []
    };
    
    console.log("Public statistics:", responseData);
    
    return new Response(
      JSON.stringify(responseData),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      }
    );
  } catch (error) {
    console.error("Error fetching public statistics:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      }
    );
  }
});
