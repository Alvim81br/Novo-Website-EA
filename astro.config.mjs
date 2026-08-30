// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://www.englishacademy.net.br',
  output: 'static',
  integrations: [
    sitemap({
      // /obrigado/ é página de conversão (noindex) — fica fora do sitemap.
      filter: (page) => !page.includes('/obrigado/'),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
