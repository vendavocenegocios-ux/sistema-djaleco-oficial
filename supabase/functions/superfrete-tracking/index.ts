import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("SUPERFRETE_API_KEY");
    if (!apiKey) throw new Error("Missing SUPERFRETE_API_KEY");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { pedido_id } = await req.json();
    if (!pedido_id) throw new Error("pedido_id is required");

    // Get pedido
    const { data: pedido, error: pedidoError } = await supabase
      .from("pedidos")
      .select("id, rastreio_codigo, superfrete_order_id")
      .eq("id", pedido_id)
      .single();

    if (pedidoError || !pedido) throw new Error("Pedido not found");

    const trackingCode = pedido.rastreio_codigo;
    const superfreteOrderId = pedido.superfrete_order_id;

    if (!superfreteOrderId) {
      return new Response(
        JSON.stringify({ error: "Este pedido não possui etiqueta SuperFrete. O rastreio automático só funciona para envios gerados via SuperFrete." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Query SuperFrete order info endpoint
    let trackingData: any = null;

    const res = await fetch(`https://api.superfrete.com/api/v0/order/info/${superfreteOrderId}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "User-Agent": "Djaleco App (contato@djaleco.com)",
        Accept: "application/json",
      },
    });

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      const text = await res.text();
      console.error(`SuperFrete returned non-JSON. Status: ${res.status}. Content-Type: ${contentType}. Preview: ${text.substring(0, 200)}`);
      return new Response(
        JSON.stringify({ error: "SuperFrete retornou resposta inválida. Verifique se a API Key está correta." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!res.ok) {
      const errorBody = await res.json();
      console.error(`SuperFrete API error ${res.status}:`, JSON.stringify(errorBody));
      return new Response(
        JSON.stringify({ error: `Erro SuperFrete: ${res.status}`, details: errorBody }),
        { status: res.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    trackingData = await res.json();

    // Extract updates from response
    const updates: Record<string, any> = {};

    if (trackingData) {
      // Update tracking code if available
      if (trackingData.tracking && !pedido.rastreio_codigo) {
        updates.rastreio_codigo = trackingData.tracking;
      }

      // Check status
      const status = (trackingData.status || "").toLowerCase();
      const delivered = status === "delivered";

      if (delivered) {
        updates.etapa_producao = "Entregue";
        updates.data_entrega = trackingData.updated_at ? new Date(trackingData.updated_at).toISOString() : new Date().toISOString();
      } else if (status === "posted" && pedido.rastreio_codigo) {
        // Mark as dispatched if posted
        if (!updates.rastreio_codigo) updates.rastreio_codigo = trackingData.tracking;
      }
    }

    // Update pedido if we have updates
    if (Object.keys(updates).length > 0) {
      const { error: updateError } = await supabase
        .from("pedidos")
        .update(updates)
        .eq("id", pedido_id);
      if (updateError) console.error("Error updating pedido:", updateError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        tracking: trackingData,
        updates,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
