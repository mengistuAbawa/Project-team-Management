import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import process from 'node:process'
import { defineConfig, loadEnv } from 'vite'

const publicPaths = [
  '/',
  '/about',
  '/features',
  '/how-it-works',
  '/roles',
  '/contact',
  '/request-access',
];

function seoAssets(siteUrl) {
  return {
    name: 'ptms-seo-assets',
    apply: 'build',
    generateBundle() {
      if (!siteUrl) {
        throw new Error('VITE_SITE_URL must be set to the public HTTPS origin before building.');
      }

      let siteOrigin;
      try {
        const parsed = new URL(siteUrl);
        if (parsed.protocol !== 'https:' || parsed.origin !== siteUrl.replace(/\/$/, '')) {
          throw new Error();
        }
        siteOrigin = parsed.origin;
      } catch {
        throw new Error('VITE_SITE_URL must be a valid HTTPS origin without a path.');
      }

      const entries = publicPaths.map((path) =>
        `  <url><loc>${siteOrigin}${path}</loc></url>`
      ).join('\n');
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`,
      });
      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: `User-agent: *\nAllow: /\nDisallow: /dashboard\nDisallow: /projects\nDisallow: /teams\nDisallow: /tasks\nDisallow: /messages\nDisallow: /meetings\nDisallow: /documents\nDisallow: /reviews\nDisallow: /notifications\nDisallow: /reports\nDisallow: /settings\nDisallow: /activity\nDisallow: /profile\nDisallow: /users\nDisallow: /admin\nDisallow: /login\nDisallow: /register\nSitemap: ${siteOrigin}/sitemap.xml\n`,
      });
    },
    transformIndexHtml(html) {
      const origin = siteUrl ? new URL(siteUrl).origin : 'http://localhost:5173';
      return html
        .replace('content="/social-preview.svg"', `content="${origin}/social-preview.svg"`)
        .replace('</head>', `<link rel="canonical" href="${origin}/" />\n<meta property="og:url" content="${origin}/" />\n</head>`);
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [tailwindcss(), react(), seoAssets(env.VITE_SITE_URL)],
  };
})
