/**
 * Single source of truth for canonical URLs, default metadata and the store's
 * NAP (name / address / phone) used by both the UI and the LocalBusiness schema.
 */

// Without VITE_SITE_URL every host the app answers on (preview deploys, the
// bare *.vercel.app domain, the custom domain) would emit its own canonical —
// the exact duplicate-content split canonical tags exist to prevent. The
// window fallback only keeps dev and misconfigured builds functional.
export const SITE_URL = (
  (import.meta.env.VITE_SITE_URL as string | undefined) ||
  (typeof window !== 'undefined' ? window.location.origin : '')
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

/** Slug-first product URL. Falls back to the id so older links keep resolving. */
export function productPath(product: { id: string; slug?: string | null }): string {
  return `/products/${product.slug?.trim() || product.id}`;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isUuid = (value: string): boolean => UUID_RE.test(value);
