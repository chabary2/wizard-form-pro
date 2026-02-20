import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";

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
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    const formData = await req.json();

    const rows = [
      ["Nome", formData.nome],
      ["Idade", formData.idade],
      ["Instagram", formData.instagram],
      ["WhatsApp", formData.whatsapp],
      ["Tipo de Empresa", formData.tipoEmpresa],
      ["Tempo de Operação", formData.tempoOperacao],
      ["Faturamento", formData.faturamento],
      ["Margem", formData.margem],
      ["Principal Gargalo", formData.gargalo],
      ["Maior Dor", formData.maiorDor],
      ["Meta (6 meses)", formData.meta],
      ["Investimento", formData.investimento],
    ]
      .filter(([, v]) => v)
      .map(
        ([label, value]) =>
          `<tr><td style="padding:8px 12px;font-weight:600;color:#374151;border-bottom:1px solid #e5e7eb">${label}</td><td style="padding:8px 12px;color:#111827;border-bottom:1px solid #e5e7eb">${value}</td></tr>`
      )
      .join("");

    const html = `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;padding:32px">
        <h1 style="font-size:20px;color:#111827;margin-bottom:24px">Nova resposta do formulário</h1>
        <table style="width:100%;border-collapse:collapse;background:#f9fafb;border-radius:8px;overflow:hidden">
          ${rows}
        </table>
        <p style="margin-top:24px;font-size:12px;color:#9ca3af">Enviado automaticamente pelo formulário MarcusPires.</p>
      </div>
    `;

    const { error } = await resend.emails.send({
      from: formData.fromEmail || "Formulário <onboarding@resend.dev>",
      to: [formData.toEmail],
      subject: `Nova lead: ${formData.nome || "Sem nome"}`,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      throw new Error(JSON.stringify(error));
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    console.error("Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
