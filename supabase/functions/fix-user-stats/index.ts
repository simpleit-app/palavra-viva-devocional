
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { email } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Get user profile
    const { data: profileData, error: profileError } = await supabaseClient
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      return new Response(
        JSON.stringify({ error: "User not found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    const userId = profileData.id;

    // Count actual read verses
    const { data: readVersesData, error: readVersesError } = await supabaseClient
      .from('read_verses')
      .select('verse_id')
      .eq('user_id', userId);

    if (readVersesError) {
      console.error("Error fetching read verses:", readVersesError);
      return new Response(
        JSON.stringify({ error: "Could not fetch read verses" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Count reflections
    const { data: reflectionsData, error: reflectionsError } = await supabaseClient
      .from('reflections')
      .select('id')
      .eq('user_id', userId);

    if (reflectionsError) {
      console.error("Error fetching reflections:", reflectionsError);
      return new Response(
        JSON.stringify({ error: "Could not fetch reflections" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Calculate points
    const chaptersRead = readVersesData.length;
    const totalReflections = reflectionsData.length;
    const points = chaptersRead + (totalReflections * 2);

    // Update profile with corrected stats
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({
        chapters_read: chaptersRead,
        total_reflections: totalReflections,
        points: points
      })
      .eq('id', userId);

    if (updateError) {
      console.error("Error updating profile:", updateError);
      return new Response(
        JSON.stringify({ error: "Could not update profile" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        user: email, 
        stats: { chaptersRead, totalReflections, points } 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
