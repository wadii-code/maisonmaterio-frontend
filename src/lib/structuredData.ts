import { SITE_NAME, SITE_URL, STORE, absoluteUrl, DEFAULT_OG_IMAGE, productPath } from './seo';
import { cleanProductName } from './format';
import type { Product } from '../types';

const ORGANIZATION_ID = `${SITE_URL}/#organization`;

export interface Crumb {
  label: string;
  /** Omit on the last crumb — the current page is not a link. */
  to?: string;
}

export function breadcrumbJsonLd(items: Crumb[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.label,
      ...(crumb.to ? { item: absoluteUrl(crumb.to) } : {}),
    })),
  };
}

type ProductLike = Pick<Product,
  'id' | 'slug' | 'name' | 'description' | 'images' | 'price' | 'discount_price' |
  'stock' | 'material' | 'rating' | 'review_count' | 'categories'>;

export function productCrumbs(product: ProductLike): Crumb[] {
  return [
    { label: 'Accueil', to: '/' },
    { label: 'Boutique', to: '/products' },
    ...(product.categories?.name && product.categories.slug
      ? [{ label: product.categories.name, to: `/products?category=${product.categories.slug}` }]
      : []),
    { label: cleanProductName(product.name) },
  ];
}

export function productJsonLd(product: ProductLike) {
  const url = absoluteUrl(productPath(product));
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: cleanProductName(product.name),
    description: product.description?.trim(),
    image: product.images ?? [],
    sku: product.id,
    url,
    brand: { '@type': 'Brand', name: SITE_NAME },
    ...(product.material ? { material: product.material } : {}),
    ...(product.categories?.name ? { category: product.categories.name } : {}),
    ...(product.review_count > 0 ? {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.rating,
        reviewCount: product.review_count,
      },
    } : {}),
    offers: {
      '@type': 'Offer',
      priceCurrency: 'MAD',
      price: product.discount_price ?? product.price,
      itemCondition: 'https://schema.org/NewCondition',
      availability: product.stock > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url,
    },
  };
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: SITE_NAME,
    url: absoluteUrl('/'),
    logo: absoluteUrl(DEFAULT_OG_IMAGE),
    email: STORE.email,
    telephone: STORE.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: STORE.street,
      addressLocality: STORE.city,
      addressCountry: STORE.country,
    },
  };
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: absoluteUrl('/'),
    inLanguage: 'fr',
    publisher: { '@id': ORGANIZATION_ID },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${absoluteUrl('/products')}?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/** The physical Casablanca showroom — drives the local pack and map results. */
export function localBusinessJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FurnitureStore',
    name: STORE.name,
    image: absoluteUrl(DEFAULT_OG_IMAGE),
    url: absoluteUrl('/'),
    telephone: STORE.phone,
    email: STORE.email,
    priceRange: STORE.priceRange,
    parentOrganization: { '@id': ORGANIZATION_ID },
    address: {
      '@type': 'PostalAddress',
      streetAddress: STORE.street,
      addressLocality: STORE.city,
      addressCountry: STORE.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: STORE.lat,
      longitude: STORE.lng,
    },
  };
}
