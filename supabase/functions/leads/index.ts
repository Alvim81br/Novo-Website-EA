// API de dados do painel de leads (a página fica em /painel/, no site).
//
// GET  ?k=CHAVE  → { unidade, label, leads: [...] } da unidade daquela chave
// POST {k,id,acao} → marca/desmarca "atendido"
//
// Por que só JSON: o runtime do Supabase reescreve o content-type da resposta
// para `text/plain`, então HTML servido daqui chega ao navegador como código à
// mostra. Com JSON isso não importa — quem lê é o `fetch()` da página, que
// ignora o content-type. A página em si é servida pelo Netlify, como HTML.
//
// A chave é conferida contra `unit_access`; chave da direção (unit nulo) vê
// todas as unidades. Roda com a service role, que nunca sai do servidor.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

interface Acesso {
  unit: string | null;
  label: string;
}

const CAMPOS =
  "id, created_at, name, phone, email, unit, course, schedule, source, contacted, contacted_at, utm_source, utm_campaign";

function admin() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

/** Só o site (e os previews) podem chamar direto do navegador. */
function origemPermitida(req: Request): string | null {
  const origem = req.headers.get("origin");
  if (!origem) return null;
  try {
    const host = new URL(origem).hostname;
    const ok = host === "englishacademy.net.br" ||
      host.endsWith(".englishacademy.net.br") ||
      host.endsWith(".netlify.app") ||
      host.endsWith(".vercel.app");
    return ok ? origem : null;
  } catch {
    return null;
  }
}

function responder(req: Request, dados: unknown, status = 200): Response {
  const headers = new Headers({
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  });
  const origem = origemPermitida(req);
  if (origem) {
    headers.set("access-control-allow-origin", origem);
    headers.set("vary", "Origin");
    headers.set("access-control-allow-headers", "content-type");
    headers.set("access-control-allow-methods", "GET, POST, OPTIONS");
  }
  return new Response(JSON.stringify(dados), { status, headers });
}

async function autorizar(token: string): Promise<Acesso | null> {
  if (!token || token.length < 8) return null;
  const { data } = await admin()
    .from("unit_access")
    .select("unit, label")
    .eq("token", token)
    .eq("active", true)
    .maybeSingle();
  if (!data) return null;
  await admin().from("unit_access").update({ last_seen_at: new Date().toISOString() }).eq("token", token);
  return data as Acesso;
}

Deno.serve(async (req: Request) => {
  const url = new URL(req.url);

  if (req.method === "OPTIONS") return responder(req, null, 204);

  if (req.method === "POST") {
    const corpo = await req.json().catch(() => ({} as Record<string, unknown>));
    const acesso = await autorizar(String(corpo.k ?? ""));
    if (!acesso) return responder(req, { erro: "chave" }, 401);

    const atendido = String(corpo.acao ?? "") === "atendido";
    // A unidade só mexe nos próprios leads (a chave da direção mexe em todos).
    let q = admin()
      .from("leads")
      .update({ contacted: atendido, contacted_at: atendido ? new Date().toISOString() : null })
      .eq("id", String(corpo.id ?? ""));
    if (acesso.unit) q = q.eq("unit", acesso.unit);

    const { error } = await q;
    if (error) return responder(req, { erro: "salvar" }, 500);
    return responder(req, { ok: true });
  }

  const acesso = await autorizar(url.searchParams.get("k") ?? "");
  if (!acesso) return responder(req, { erro: "chave" }, 401);

  let consulta = admin().from("leads").select(CAMPOS).order("created_at", { ascending: false }).limit(300);
  if (acesso.unit) consulta = consulta.eq("unit", acesso.unit);

  const { data, error } = await consulta;
  if (error) return responder(req, { erro: "consulta" }, 500);

  return responder(req, { unidade: acesso.unit, label: acesso.label, leads: data ?? [] });
});
