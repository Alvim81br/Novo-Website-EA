// Painel de leads da English Academy — uma chave de acesso por unidade.
//
// GET  /?k=CHAVE          → lista os leads daquela unidade (pendentes por padrão)
// GET  /?k=CHAVE&f=todos  → inclui os já atendidos
// POST /                  → marca/desmarca "atendido" (formulário HTML, sem JS)
//
// A chave é conferida contra a tabela `unit_access`; chave da direção (unit
// nulo) enxerga todas as unidades. Nada aqui usa a anon key: a função roda com
// a service role, que só existe no servidor.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const TZ = "America/Sao_Paulo";

interface Acesso {
  token: string;
  unit: string | null;
  label: string;
}

interface Lead {
  id: string;
  created_at: string;
  name: string;
  phone: string;
  email: string | null;
  unit: string;
  course: string;
  schedule: string | null;
  source: string | null;
  contacted: boolean;
  contacted_at: string | null;
  utm_source: string | null;
  utm_campaign: string | null;
  utm_medium: string | null;
}

function admin() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

function esc(value: unknown): string {
  return String(value ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!)
  );
}

function pagina(titulo: string, corpo: string, status = 200): Response {
  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${esc(titulo)}</title><style>${CSS}</style></head><body>${corpo}</body></html>`;

  // Corpo em bytes + Headers explícito: com string crua o runtime pode carimbar
  // um `text/plain` por cima, e aí o navegador mostra o código em vez da página.
  const headers = new Headers();
  headers.set("content-type", "text/html; charset=utf-8");
  // A chave viaja na URL: sem Referer, ela não vaza para o WhatsApp e afins.
  headers.set("referrer-policy", "no-referrer");
  headers.set("cache-control", "no-store");
  headers.set("x-robots-tag", "noindex, nofollow");

  return new Response(new TextEncoder().encode(html), { status, headers });
}

const CSS = `
:root{--navy:#00327d;--navy-dark:#001f4d;--rosa:#d6336c;--verde:#25d366;--cinza:#6b7280;--borda:#e5e7eb}
*{box-sizing:border-box}
body{margin:0;background:#f4f6fb;color:#1f2937;font:16px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
header{background:linear-gradient(135deg,var(--navy-dark),var(--navy));color:#fff;padding:20px 16px}
.wrap{max-width:720px;margin:0 auto}
header h1{margin:0;font-size:19px;font-weight:800;letter-spacing:-.01em}
header p{margin:4px 0 0;font-size:13px;color:#c7d6f0}
.resumo{display:flex;gap:8px;margin-top:14px;flex-wrap:wrap}
.pill{background:rgba(255,255,255,.14);border-radius:999px;padding:5px 12px;font-size:13px;font-weight:600}
.pill b{font-size:15px}
main{padding:16px;padding-bottom:48px}
.abas{display:flex;gap:8px;margin-bottom:14px}
.aba{flex:1;text-align:center;padding:9px;border-radius:999px;background:#fff;border:1px solid var(--borda);
  color:var(--cinza);text-decoration:none;font-size:14px;font-weight:700}
.aba.on{background:var(--navy);border-color:var(--navy);color:#fff}
.card{background:#fff;border:1px solid var(--borda);border-radius:16px;padding:16px;margin-bottom:12px;
  box-shadow:0 1px 3px rgba(16,24,40,.05)}
.card.feito{opacity:.62}
.topo{display:flex;justify-content:space-between;align-items:flex-start;gap:10px}
.nome{margin:0;font-size:18px;font-weight:800;color:var(--navy-dark);letter-spacing:-.01em}
.quando{font-size:12px;color:var(--cinza);white-space:nowrap;padding-top:4px}
.tags{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0 0}
.tag{font-size:12px;font-weight:600;padding:3px 9px;border-radius:999px;background:#eef2f9;color:#3b4a63}
.tag.chat{background:#fce7ef;color:#a61e4d}
.tag.campanha{background:#fff4e0;color:#8a5a00}
.tag.unidade{background:#e7f0ff;color:var(--navy)}
.dados{margin:12px 0 0;font-size:14px;color:#374151}
.dados div{margin-top:3px}
.dados a{color:var(--navy);text-decoration:none;font-weight:600}
.acoes{display:flex;gap:8px;margin-top:14px;flex-wrap:wrap}
.btn{flex:1 1 140px;text-align:center;padding:11px 14px;border-radius:999px;font-size:14px;font-weight:700;
  text-decoration:none;border:0;cursor:pointer;font-family:inherit}
.btn.zap{background:var(--verde);color:#fff}
.btn.ok{background:#fff;border:1px solid var(--navy);color:var(--navy)}
.btn.desfazer{background:#fff;border:1px solid var(--borda);color:var(--cinza);flex:0 0 auto}
.vazio{background:#fff;border:1px dashed var(--borda);border-radius:16px;padding:36px 20px;text-align:center;color:var(--cinza)}
.rodape{margin-top:22px;font-size:12px;color:var(--cinza);text-align:center;line-height:1.6}
form.entrar{background:#fff;border:1px solid var(--borda);border-radius:16px;padding:22px;margin-top:18px}
form.entrar label{display:block;font-size:14px;font-weight:700;color:var(--navy-dark);margin-bottom:8px}
form.entrar input{width:100%;padding:12px 14px;border:1px solid var(--borda);border-radius:12px;font-size:16px;font-family:inherit}
form.entrar button{width:100%;margin-top:12px;padding:12px;border:0;border-radius:999px;background:var(--navy);
  color:#fff;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit}
.erro{background:#fef2f2;border:1px solid #fecaca;color:#991b1b;border-radius:12px;padding:12px 14px;font-size:14px}
`;

function quando(iso: string): string {
  const data = new Date(iso);
  const min = Math.floor((Date.now() - data.getTime()) / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `há ${min} min`;
  if (min < 24 * 60) return `há ${Math.floor(min / 60)}h`;
  if (min < 48 * 60) return "ontem";
  return data.toLocaleDateString("pt-BR", { timeZone: TZ, day: "2-digit", month: "2-digit" });
}

function dataHora(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    timeZone: TZ,
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function whatsapp(lead: Lead): string {
  const digitos = lead.phone.replace(/\D/g, "");
  if (digitos.length < 10) return "";
  const numero = digitos.length <= 11 ? `55${digitos}` : digitos;
  const primeiro = lead.name.trim().split(/\s+/)[0] ?? "";
  const texto = encodeURIComponent(
    `Olá ${primeiro}! Aqui é da English Academy 😊 Vi que você pediu uma proposta pelo nosso site. Posso te passar os valores e condições?`,
  );
  return `https://wa.me/${numero}?text=${texto}`;
}

function cartao(lead: Lead, mostrarUnidade: boolean, token: string, filtro: string): string {
  const doChat = (lead.source ?? "").startsWith("chat:");
  const zap = whatsapp(lead);
  const campanha = lead.utm_campaign ?? lead.utm_source;

  const tags = [
    `<span class="tag ${doChat ? "chat" : ""}">${doChat ? "💬 Chat do site" : "📝 Formulário"}</span>`,
    mostrarUnidade ? `<span class="tag unidade">${esc(lead.unit)}</span>` : "",
    lead.course && !lead.course.startsWith("Não informado")
      ? `<span class="tag">${esc(lead.course)}</span>`
      : "",
    lead.schedule ? `<span class="tag">🕒 ${esc(lead.schedule)}</span>` : "",
    campanha ? `<span class="tag campanha">📣 ${esc(campanha)}</span>` : "",
  ].join("");

  return `<article class="card${lead.contacted ? " feito" : ""}">
  <div class="topo">
    <h2 class="nome">${esc(lead.name)}</h2>
    <span class="quando" title="${esc(dataHora(lead.created_at))}">${esc(quando(lead.created_at))}</span>
  </div>
  <div class="tags">${tags}</div>
  <div class="dados">
    <div>📱 <a href="tel:${esc(lead.phone.replace(/\s/g, ""))}">${esc(lead.phone)}</a></div>
    ${lead.email ? `<div>✉️ <a href="mailto:${esc(lead.email)}">${esc(lead.email)}</a></div>` : ""}
    ${lead.contacted ? `<div style="color:#15803d;font-weight:600">✓ Atendido${lead.contacted_at ? ` em ${esc(dataHora(lead.contacted_at))}` : ""}</div>` : ""}
  </div>
  <div class="acoes">
    ${zap ? `<a class="btn zap" href="${esc(zap)}" target="_blank" rel="noreferrer noopener">Chamar no WhatsApp</a>` : ""}
    <form method="post" style="flex:1 1 140px;margin:0">
      <input type="hidden" name="k" value="${esc(token)}">
      <input type="hidden" name="f" value="${esc(filtro)}">
      <input type="hidden" name="id" value="${esc(lead.id)}">
      <input type="hidden" name="acao" value="${lead.contacted ? "reabrir" : "atendido"}">
      <button class="btn ${lead.contacted ? "desfazer" : "ok"}" type="submit">
        ${lead.contacted ? "Reabrir" : "Marcar como atendido"}
      </button>
    </form>
  </div>
</article>`;
}

function telaDeEntrada(mensagem = ""): Response {
  return pagina(
    "Painel de Leads — English Academy",
    `<header><div class="wrap"><h1>Painel de Leads</h1><p>English Academy</p></div></header>
<main><div class="wrap">
  ${mensagem ? `<div class="erro">${esc(mensagem)}</div>` : ""}
  <form class="entrar" method="get">
    <label for="k">Cole aqui a sua chave de acesso</label>
    <input id="k" name="k" autocomplete="off" spellcheck="false" placeholder="ex.: 3f9a1c…" required>
    <button type="submit">Ver meus leads</button>
  </form>
  <p class="rodape">Cada unidade tem a sua chave. Guarde o link nos favoritos do celular:<br>ele já abre direto na sua lista.</p>
</div></main>`,
    mensagem ? 401 : 200,
  );
}

async function autorizar(token: string): Promise<Acesso | null> {
  if (!token || token.length < 8) return null;
  const { data } = await admin()
    .from("unit_access")
    .select("token, unit, label")
    .eq("token", token)
    .eq("active", true)
    .maybeSingle();
  if (!data) return null;
  await admin().from("unit_access").update({ last_seen_at: new Date().toISOString() }).eq("token", token);
  return data as Acesso;
}

Deno.serve(async (req: Request) => {
  const url = new URL(req.url);

  if (req.method === "POST") {
    const form = await req.formData();
    const token = String(form.get("k") ?? "");
    const acesso = await autorizar(token);
    if (!acesso) return telaDeEntrada("Chave inválida ou desativada.");

    const id = String(form.get("id") ?? "");
    const atendido = String(form.get("acao") ?? "") === "atendido";
    const filtro = String(form.get("f") ?? "");

    // A unidade só mexe nos próprios leads (a chave da direção mexe em todos).
    let q = admin()
      .from("leads")
      .update({ contacted: atendido, contacted_at: atendido ? new Date().toISOString() : null })
      .eq("id", id);
    if (acesso.unit) q = q.eq("unit", acesso.unit);
    await q;

    const destino = `${url.pathname}?k=${encodeURIComponent(token)}${filtro ? `&f=${encodeURIComponent(filtro)}` : ""}`;
    return new Response(null, { status: 303, headers: { Location: destino, "Cache-Control": "no-store" } });
  }

  const token = url.searchParams.get("k") ?? "";
  if (!token) return telaDeEntrada();

  const acesso = await autorizar(token);
  if (!acesso) return telaDeEntrada("Chave inválida ou desativada.");

  const filtro = url.searchParams.get("f") === "todos" ? "todos" : "pendentes";

  let consulta = admin()
    .from("leads")
    .select(
      "id, created_at, name, phone, email, unit, course, schedule, source, contacted, contacted_at, utm_source, utm_campaign, utm_medium",
    )
    .order("created_at", { ascending: false })
    .limit(300);
  if (acesso.unit) consulta = consulta.eq("unit", acesso.unit);
  if (filtro === "pendentes") consulta = consulta.eq("contacted", false);

  const { data, error } = await consulta;
  if (error) return pagina("Erro", `<main><div class="wrap"><div class="erro">Não consegui carregar os leads agora. Tente de novo em instantes.</div></div></main>`, 500);

  const leads = (data ?? []) as Lead[];
  const hoje = leads.filter((l) => Date.now() - new Date(l.created_at).getTime() < 24 * 3600 * 1000).length;
  const pendentes = leads.filter((l) => !l.contacted).length;

  const link = (f: string) => `${url.pathname}?k=${encodeURIComponent(token)}${f === "todos" ? "&f=todos" : ""}`;

  const corpo = `<header><div class="wrap">
  <h1>${esc(acesso.unit ?? "Todas as unidades")}</h1>
  <p>${esc(acesso.label)}</p>
  <div class="resumo">
    <span class="pill"><b>${pendentes}</b> a contatar</span>
    <span class="pill"><b>${hoje}</b> nas últimas 24h</span>
  </div>
</div></header>
<main><div class="wrap">
  <nav class="abas">
    <a class="aba ${filtro === "pendentes" ? "on" : ""}" href="${esc(link("pendentes"))}">A contatar</a>
    <a class="aba ${filtro === "todos" ? "on" : ""}" href="${esc(link("todos"))}">Todos</a>
  </nav>
  ${
    leads.length
      ? leads.map((l) => cartao(l, !acesso.unit, token, filtro)).join("")
      : `<div class="vazio">${filtro === "pendentes" ? "Nenhum lead esperando contato. 🎉" : "Ainda não há leads por aqui."}</div>`
  }
  <p class="rodape">Dados pessoais de quem pediu contato — uso interno da English Academy.<br>
  Não repasse esta página nem a sua chave para fora da equipe (LGPD).</p>
</div></main>`;

  return pagina(`Leads — ${acesso.unit ?? "Todas as unidades"}`, corpo);
});
