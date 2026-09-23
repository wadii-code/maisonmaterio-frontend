import { SITE_NAME, SITE_URL, STORE, absoluteUrl, DEFAULT_OG_IMAGE } from './seo';

const ORGANIZATION_ID = `${SITE_URL}/#organization`;

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
