/**
 * Writes dist/sitemap.xml after the Vite build and stamps the real origin into
 * dist/robots.txt.
 *
 * Product and category URLs are pulled live from Supabase (anon key + the
 * "active products are public" RLS policy). If that fetch fails the script
 * still emits the static routes — a stale-but-valid sitemap beats a red build.
 */
import { writeFile, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { distDir, SITE_URL, hasSupabase, fetchTable } from './site.mjs';

const STATIC_ROUTES = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/products', changefreq: 'daily', priority: '0.9' },
  { path: '/about', changefreq: 'monthly', priority: '0.5' },
  { path: '/personalize', changefreq: 'monthly', priority: '0.6' },
];

const escapeXml = (value) =>
  String(value).replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c]);

async function collectDynamicUrls() {
  if (!hasSupabase) {
    console.warn('[sitemap] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY missing — static routes only.');
    return [];
  }

  const [products, categories] = await Promise.all([
    fetchTable('products', 'select=slug,id,updated_at&status=eq.active&order=updated_at.desc'),
    fetchTable('categories', 'select=slug'),
  ]);

  return [
    ...categories
      .filter((c) => c.slug)
      .map((c) => ({ path: `/products?category=${encodeURIComponent(c.slug)}`, changefreq: 'weekly', priority: '0.8' })),
    ...products.map((p) => ({
      path: `/products/${p.slug || p.id}`,
      lastmod: p.updated_at ? new Date(p.updated_at).toISOString().slice(0, 10) : undefined,
      changefreq: 'weekly',
      priority: '0.7',
    })),
  ];
}

function renderSitemap(urls) {
  const entries = urls
    .map(({ path, lastmod, changefreq, priority }) =>
      [
        '  <url>',
        `    <loc>${escapeXml(`${SITE_URL}${path}`)}</loc>`,
        lastmod ? `    <lastmod>${lastmod}</lastmod>` : null,
        changefreq ? `    <changefreq>${changefreq}</changefreq>` : null,
        priority ? `    <priority>${priority}</priority>` : null,
        '  </url>',
      ]
        .filter(Boolean)
        .join('\n')
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;
}

async function stampRobots() {
  const robotsPath = resolve(distDir, 'robots.txt');
  if (!existsSync(robotsPath)) return;
  const current = await readFile(robotsPath, 'utf8');
  await writeFile(robotsPath, current.replace(/^Sitemap:.*$/m, `Sitemap: ${SITE_URL}/sitemap.xml`), 'utf8');
}

async function main() {
  if (!existsSync(distDir)) {
    console.warn('[sitemap] dist/ not found — run this after `vite build`.');
    return;
  }

  let dynamicUrls = [];
  try {
    dynamicUrls = await collectDynamicUrls();
  } catch (err) {
    console.warn(`[sitemap] could not load catalogue (${err.message}) — static routes only.`);
  }

  const urls = [...STATIC_ROUTES, ...dynamicUrls];
  await writeFile(resolve(distDir, 'sitemap.xml'), renderSitemap(urls), 'utf8');
  await stampRobots();
  console.log(`[sitemap] wrote ${urls.length} URLs to dist/sitemap.xml (${SITE_URL})`);
}

main().catch((err) => {
  console.warn(`[sitemap] skipped: ${err.message}`);
});
