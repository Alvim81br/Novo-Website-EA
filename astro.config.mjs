// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://www.englishacademy.net.br',
  output: 'static',
  integrations: [
    sitemap({
      // Fora do sitemap: /obrigado/ é página de conversão (noindex) e /painel/
      // é ferramenta interna do comercial. Ambas com noindex no HTML também.
      filter: (page) => !page.includes('/obrigado/') && !page.includes('/painel/'),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
