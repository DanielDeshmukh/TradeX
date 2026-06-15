import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { security_ids } = await req.json();

    let query = supabase
      .from("trading_signals")
      .select("*")
      .order("created_at", { ascending: false });

    if (security_ids && security_ids.length > 0) {
      query = query.in("security_id", security_ids);
    }

    const { data: signals, error } = await query.limit(50);

    if (error) throw error;

    // Get latest signal per security
    const latestBySecurity: Record<string, any> = {};
    for (const sig of signals || []) {
      if (!latestBySecurity[sig.security_id]) {
        latestBySecurity[sig.security_id] = sig;
      }
    }

    return new Response(
      JSON.stringify({ signals: Object.values(latestBySecurity) }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
