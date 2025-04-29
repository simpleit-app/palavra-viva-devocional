
// Follow this setup guide to integrate the Deno runtime into your application:
// https://deno.com/manual/getting_started/javascript_runtime
// Learn more about Deno: https://deno.com/runtime

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Use Supabase service role key to bypass RLS policies
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    console.log('Fetching public statistics...')

    // Run database queries in parallel for better performance
    const [subscribersResult, reflectionsResult, versesReadResult] = await Promise.all([
      // Get active subscribers count (where subscribed = true)
      supabaseClient
        .from('subscribers')
        .select('*', { count: 'exact', head: true })
        .eq('subscribed', true),
      
      // Get total reflections count
      supabaseClient
        .from('reflections')
        .select('*', { count: 'exact', head: true }),
      
      // Get total verses read count
      supabaseClient
        .from('read_verses')
        .select('*', { count: 'exact', head: true })
    ])

    // Check for errors in any of the queries
    if (subscribersResult.error) {
      throw new Error(`Error fetching subscribers: ${subscribersResult.error.message}`)
    }
    
    if (reflectionsResult.error) {
      throw new Error(`Error fetching reflections: ${reflectionsResult.error.message}`)
    }
    
    if (versesReadResult.error) {
      throw new Error(`Error fetching read verses: ${versesReadResult.error.message}`)
    }

    // Collect and return the statistics data
    const stats = {
      activeSubscribersCount: subscribersResult.count || 0,
      reflectionsCount: reflectionsResult.count || 0,
      versesReadCount: versesReadResult.count || 0
    }

    console.log('Public statistics:', stats)

    return new Response(
      JSON.stringify(stats),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    )
  } catch (error) {
    console.error('Error in public-stats function:', error.message)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})
