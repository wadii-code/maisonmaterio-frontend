/**
 * Single source of truth for canonical URLs, default metadata and the store's
 * NAP (name / address / phone) used by both the UI and the LocalBusiness schema.
 */

// Keep in sync with scripts/site.mjs.
export const PRODUCTION_SITE_URL = 'https://www.maisonmateriau.com';

// Every deploy (previews, *.vercel.app) must emit the live domain as canonical,
// or they split ranking signals. Only the dev server uses its own origin.
export const SITE_URL = (
  (import.meta.env.VITE_SITE_URL as string | undefined) ||
  (import.meta.env.DEV && typeof window !== 'undefined' ? window.location.origin : PRODUCTION_SITE_URL)
).replace(/\/+$/, '');

export const SITE_NAME = 'Maison Materiau';
export const OG_LOCALE = 'fr_MA';

export const DEFAULT_TITLE = `${SITE_NAME} — Mobilier, décoration & matériaux de construction à Casablanca`;

export const DEFAULT_DESCRIPTION =
  'Mobilier haut de gamme, décoration d’intérieur et matériaux de construction à Casablanca. ' +
  'Plus de 200 produits uniques, livraison partout au Maroc.';

export const DEFAULT_OG_IMAGE = '/MAISONMATERIOLOGO.png';

export const STORE = {
  name: SITE_NAME,
  street: 'Boulevard Mohammed V',
  city: 'Casablanca',
  country: 'MA',
  get address() {
    return `${this.street}, ${this.city}, Maroc`;
  },
  phone: '+212645104432',
  phoneDisplay: '+212 645-104432',
  email: 'maisonmateriau@gmail.com',
  lat: 33.541697,
  lng: -7.604112,
  priceRange: 'MAD',
} as const;

export function absoluteUrl(path = '/'): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}/${path.replace(/^\/+/, '')}`;
}

export function buildTitle(title?: string | null): string {
  const trimmed = title?.trim();
  if (!trimmed) return DEFAULT_TITLE;
  return trimmed.includes(SITE_NAME) ? trimmed : `${trimmed} — ${SITE_NAME}`;
}

/** Collapse whitespace and cut to a length Google will actually render. */
export function clampDescription(text?: string | null, max = 160): string {
  const clean = text?.replace(/\s+/g, ' ').trim();
  if (!clean) return '';
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

export interface SeoOptions {
  title?: string;
  description?: string | null;
  image?: string | null;
  /** Canonical path override. Defaults to the current pathname (query dropped). */
  canonicalPath?: string;
  /** Private or transactional pages that must stay out of the index. */
  noindex?: boolean;
  type?: 'website' | 'product' | 'article';
  jsonLd?: object | object[];
}

export type MetaSpec = { key: 'name' | 'property'; value: string; content: string };

/** Also used by scripts/prerender.mjs, so prerendered HTML matches what <Seo> renders. */
export function buildHeadTags(options: SeoOptions, pathname: string) {
  const { title, description, image, canonicalPath, noindex = false, type = 'website', jsonLd } = options;
  const canonical = absoluteUrl(canonicalPath ?? pathname);
  const fullTitle = buildTitle(title);
  const desc = clampDescription(description) || DEFAULT_DESCRIPTION;
  const ogImage = absoluteUrl(image || DEFAULT_OG_IMAGE);

  const metas: MetaSpec[] = [
    { key: 'name', value: 'description', content: desc },
    {
      key: 'name',
      value: 'robots',
      content: noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1',
    },
    { key: 'property', value: 'og:site_name', content: SITE_NAME },
    { key: 'property', value: 'og:type', content: type },
    { key: 'property', value: 'og:title', content: fullTitle },
    { key: 'property', value: 'og:description', content: desc },
    { key: 'property', value: 'og:url', content: canonical },
    { key: 'property', value: 'og:image', content: ogImage },
    { key: 'property', value: 'og:locale', content: OG_LOCALE },
    { key: 'name', value: 'twitter:card', content: 'summary_large_image' },
    { key: 'name', value: 'twitter:title', content: fullTitle },
    { key: 'name', value: 'twitter:description', content: desc },
    { key: 'name', value: 'twitter:image', content: ogImage },
  ];

  return {
    title: fullTitle,
    metas,
    canonical,
    jsonLd: jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [],
  };
}

/** Slug-first product URL. Falls back to the id so older links keep resolving. */
export function productPath(product: { id: string; slug?: string | null }): string {
  return `/products/${product.slug?.trim() || product.id}`;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isUuid = (value: string): boolean => UUID_RE.test(value);
