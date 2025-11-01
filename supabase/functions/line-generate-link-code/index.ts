import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'userId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Generate 6-digit code
    const linkCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Set expiration to 5 minutes from now
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    // Delete any existing unused codes for this user
    await supabase
      .from('line_link_codes')
      .delete()
      .eq('user_id', userId)
      .is('used_at', null);

    // Insert new link code
    const { data, error } = await supabase
      .from('line_link_codes')
      .insert({
        user_id: userId,
        link_code: linkCode,
        expires_at: expiresAt
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create link code:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to create link code' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Generated link code for user:', userId, 'code:', linkCode);

    return new Response(
      JSON.stringify({ linkCode, expiresAt }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
