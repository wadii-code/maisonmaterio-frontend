/**
 * Writes static HTML with real head tags and a plain copy of the content for
 * every active product, /about and /personalize, for crawlers and link
 * previews that don't run JS. Other URLs (new products, /products filters,
 * home) keep the generic index.html. Never fails the build.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, resolve, sep } from 'node:path';
import { createServer } from 'vite';
import { root, distDir, SITE_URL, hasSupabase, fetchTable } from './site.mjs';

const PRODUCT_FIELDS =
  'id,slug,name,description,meta_title,meta_description,images,price,discount_price,' +
  'stock,material,rating,review_count,categories(name,slug)';

const SEO_BLOCK = /<!-- seo:start -->[\s\S]*?<!-- seo:end -->/;
const ROOT_DIV = '<div id="root"></div>';

const esc = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// JSON in a <script> only needs "</" neutralised.
const scriptJson = (value) => JSON.stringify(value).replace(/</g, '\\u003c');

function renderHead({ title, metas, canonical, jsonLd }) {
  return [
    `<title>${esc(title)}</title>`,
    ...metas.map((m) => `<meta ${m.key}="${esc(m.value)}" content="${esc(m.content)}" />`),
    `<link rel="canonical" href="${esc(canonical)}" />`,
    // data-prerender: <Seo> removes these before adding its own, so no duplicates.
    ...jsonLd.map((block) => `<script type="application/ld+json" data-prerender>${scriptJson(block)}</script>`),
  ]
    .map((line) => `    ${line}`)
    .join('\n');
}

const NAV =
  '<nav><a href="/">Accueil</a> · <a href="/products">Boutique</a> · ' +
  '<a href="/personalize">Sur mesure</a> · <a href="/about">À propos</a></nav>';

const crumbsHtml = (crumbs) =>
  `<nav aria-label="Fil d'Ariane"><ol>${crumbs
    .map((c) => `<li>${c.to ? `<a href="${esc(c.to)}">${esc(c.label)}</a>` : esc(c.label)}</li>`)
    .join('')}</ol></nav>`;

function productBody(product, lib) {
  const name = lib.cleanProductName(product.name);
  const price = lib.formatPrice(product.discount_price ?? product.price);
  return [
    NAV,
    crumbsHtml(lib.productCrumbs(product)),
    '<main><article>',
    `<h1>${esc(name)}</h1>`,
    `<p>${esc(price)}${product.stock > 0 ? '' : ' — Rupture de stock'}</p>`,
    // lazy + display:none => never downloaded by visitors.
    ...(product.images ?? []).slice(0, 4).map(
      (src, i) => `<img src="${esc(src)}" alt="${esc(i ? `${name} — photo ${i + 1}` : name)}" loading="lazy" />`
    ),
    product.material ? `<p>Matériau : ${esc(product.material)}</p>` : '',
    `<p>${esc(product.description?.trim())}</p>`,
    '</article></main>',
  ].join('');
}

function pageBody(heading, text, crumbs) {
  return `${NAV}${crumbsHtml(crumbs)}<main><h1>${esc(heading)}</h1><p>${esc(text)}</p></main>`;
}

// /about -> dist/about.html, served at /about by vercel.json's cleanUrls.
async function writePage(path, html) {
  const file = resolve(distDir, `.${path}.html`);
  if (!file.startsWith(distDir + sep)) throw new Error(`refusing to write outside dist: ${path}`);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, html, 'utf8');
}

async function main() {
  const shellPath = resolve(distDir, 'index.html');
  if (!existsSync(shellPath)) {
    console.warn('[prerender] dist/index.html not found — run this after `vite build`.');
    return;
  }

  // Link previews ignore relative image URLs.
  let shell = await readFile(shellPath, 'utf8');
  shell = shell.replace(/(<meta (?:property|name)="(?:og|twitter):image" content=")\//g, `$1${SITE_URL}/`);
  await writeFile(shellPath, shell, 'utf8');

  if (!SEO_BLOCK.test(shell) || !shell.includes(ROOT_DIV)) {
    console.warn('[prerender] index.html is missing the seo markers or the empty #root — skipping.');
    return;
  }

  const vite = await createServer({
    root,
    mode: 'production',
    logLevel: 'error',
    appType: 'custom',
    server: { middlewareMode: true, hmr: false, watch: null },
    optimizeDeps: { noDiscovery: true, include: [] },
  });

  try {
    const seo = await vite.ssrLoadModule('/src/lib/seo.ts');
    const pages = await vite.ssrLoadModule('/src/lib/pageSeo.ts');
    const lib = {
      ...(await vite.ssrLoadModule('/src/lib/structuredData.ts')),
      ...(await vite.ssrLoadModule('/src/lib/format.ts')),
    };

    const about = pages.aboutSeo();
    const personalize = pages.personalizeSeo();
    const outputs = [
      { path: '/about', seo: about, body: pageBody('À propos', about.description, pages.ABOUT_CRUMBS) },
      {
        path: '/personalize',
        seo: personalize,
        body: pageBody(personalize.title, personalize.description, [{ label: 'Accueil', to: '/' }, { label: personalize.title }]),
      },
    ];

    if (hasSupabase) {
      try {
        const products = await fetchTable('products', `select=${PRODUCT_FIELDS}&status=eq.active`);
        for (const product of products) {
          const path = seo.productPath(product);
          // Other characters could map to a different file than the URL Vercel sees.
          if (!/^\/products\/[a-z0-9-]+$/i.test(path)) continue;
          outputs.push({ path, seo: pages.productSeo(product), body: productBody(product, lib) });
        }
      } catch (err) {
        console.warn(`[prerender] could not load products (${err.message}) — static pages only.`);
      }
    } else {
      console.warn('[prerender] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY missing — static pages only.');
    }

    for (const { path, seo: options, body } of outputs) {
      const head = renderHead(seo.buildHeadTags(options, path));
      const html = shell
        .replace(SEO_BLOCK, () => `<!-- seo:start -->\n${head}\n    <!-- seo:end -->`)
        .replace(ROOT_DIV, () => `<div id="root"><div data-prerender>${body}</div></div>`);
      await writePage(path, html);
    }

    console.log(`[prerender] wrote ${outputs.length} pages (${SITE_URL})`);
  } finally {
    await vite.close();
  }
}

main().catch((err) => {
  console.warn(`[prerender] skipped: ${err.message}`);
});
