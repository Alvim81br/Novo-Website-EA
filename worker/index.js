// Réplica, no Cloudflare, do comportamento que o site tem no Netlify
// (netlify.toml / vercel.json): proxy /api/leads para a Edge Function do
// Supabase (mesma origem, sem CORS — o painel /painel/ depende disso),
// redirect do domínio raiz para www e headers de segurança/cache.
const LEADS_FN = 'https://kitekwfjytbewwqatmit.functions.supabase.co/leads';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // domínio raiz → www (canônico)
    if (url.hostname === 'englishacademy.net.br') {
      url.hostname = 'www.englishacademy.net.br';
      return Response.redirect(url.toString(), 301);
    }

    // dados do painel de leads — o navegador fala com o próprio site
    if (url.pathname === '/api/leads') {
      const upstream = new URL(LEADS_FN);
      upstream.search = url.search;
      return fetch(new Request(upstream, request));
    }

    const res = await env.ASSETS.fetch(request);
    const headers = new Headers(res.headers);
    headers.set('X-Frame-Options', 'SAMEORIGIN');
    headers.set('X-Content-Type-Options', 'nosniff');
    headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    if (url.pathname.startsWith('/_astro/')) {
      headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (/\.(webp|jpe?g|png)$/i.test(url.pathname)) {
      headers.set('Cache-Control', 'public, max-age=86400');
    }
    return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
  },
};
