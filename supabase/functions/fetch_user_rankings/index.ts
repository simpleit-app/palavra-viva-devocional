
import { serve } from "https://deno.land/std@0.182.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    let limitCount = 10;
    
    // Extract limit parameter if present
    if (req.method === "POST") {
      try {
        const { limit_count } = await req.json();
        if (limit_count && typeof limit_count === 'number') {
          limitCount = limit_count;
        }
      } catch (error) {
        console.error("Error parsing request body", error);
      }
    }

    // Query the user_rankings view
    const { data, error } = await supabaseClient
      .from('user_rankings')
      .select('rank, nickname, points, level')
      .order('rank', { ascending: true })
      .limit(limitCount);

    if (error) {
      throw error;
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error:", error);

    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
