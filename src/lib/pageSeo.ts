// Shared with scripts/prerender.mjs: edit page SEO here, not inline in the pages.
import { productPath, type SeoOptions } from './seo';
import { cleanProductName } from './format';
import { breadcrumbJsonLd, organizationJsonLd, productCrumbs, productJsonLd, type Crumb } from './structuredData';
import type { Product } from '../types';

export const ABOUT_CRUMBS: Crumb[] = [{ label: 'Accueil', to: '/' }, { label: 'À propos' }];

export function aboutSeo(): SeoOptions {
  return {
    title: 'À propos',
    description:
      'L’histoire de Maison Materiau : une équipe de designers et d’artisans à Casablanca qui sélectionne du mobilier, de la décoration et des matériaux conçus pour durer.',
    canonicalPath: '/about',
    jsonLd: [breadcrumbJsonLd(ABOUT_CRUMBS), organizationJsonLd()],
  };
}

export function personalizeSeo(title = 'Personnalisez votre produit'): SeoOptions {
  return {
    title,
    description:
      'Faites fabriquer un meuble sur mesure par Maison Materiau : dimensions, matériaux et finitions au choix. Devis gratuit par WhatsApp depuis Casablanca.',
    canonicalPath: '/personalize',
    jsonLd: breadcrumbJsonLd([{ label: 'Accueil', to: '/' }, { label: title }]),
  };
}

type SeoProduct = Parameters<typeof productJsonLd>[0] & Pick<Product, 'meta_title' | 'meta_description'>;

export function productSeo(product: SeoProduct): SeoOptions {
  return {
    type: 'product',
    title: product.meta_title?.trim() || cleanProductName(product.name),
    description: product.meta_description?.trim() || product.description,
    image: product.images?.[0],
    // Always the slug URL, even when reached via a UUID.
    canonicalPath: productPath(product),
    jsonLd: [breadcrumbJsonLd(productCrumbs(product)), productJsonLd(product)],
  };
}
