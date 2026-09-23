import { useId, useInsertionEffect, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import {
  SITE_NAME,
  OG_LOCALE,
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  absoluteUrl,
  buildTitle,
  clampDescription,
} from '../../lib/seo';

/**
 * Head manager for this SPA.
 *
 * Replaces react-helmet-async, which silently stopped applying tags here (the
 * package is unmaintained and misbehaves under React 18 concurrent rendering).
 * Nothing in this app is server-rendered, so a direct document.head sync is
 * both simpler and deterministic.
 *
 * Render at most one <Seo> per route: the last one mounted wins.
 */

const OWNER = 'data-seo-owner';

type MetaSpec = { key: 'name' | 'property'; value: string; content: string };

function syncHead(ownerId: string, title: string, metas: MetaSpec[], canonical: string, jsonLd: object[]) {
  // Drop everything this instance created last time; tags it merely updated
  // (the static ones from index.html) are overwritten below instead.
  document.head.querySelectorAll(`[${OWNER}="${ownerId}"]`).forEach(node => node.remove());

  document.title = title;

  for (const { key, value, content } of metas) {
    // Reuse the index.html tag when there is one, so a page never ends up with
    // two competing descriptions.
    let el = document.head.querySelector<HTMLMetaElement>(`meta[${key}="${value}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(key, value);
      el.setAttribute(OWNER, ownerId);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  }

  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    link.setAttribute(OWNER, ownerId);
    document.head.appendChild(link);
  }
  link.href = canonical;

  for (const block of jsonLd) {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute(OWNER, ownerId);
    script.textContent = JSON.stringify(block);
    document.head.appendChild(script);
  }
}

interface SeoProps {
  title?: string;
  description?: string | null;
  image?: string | null;
  /** Canonical path override. Defaults to the current pathname (query dropped). */
  canonicalPath?: string;
  /** Private or transactional pages that must stay out of the index. */
  noindex?: boolean;
  type?: 'website' | 'product' | 'article';
  jsonLd?: object | object[];
  children?: ReactNode;
}

export function Seo({
  title,
  description,
  image,
  canonicalPath,
  noindex = false,
  type = 'website',
  jsonLd,
}: SeoProps) {
  const { pathname } = useLocation();
  const ownerId = useId();

  const canonical = absoluteUrl(canonicalPath ?? pathname);
  const fullTitle = buildTitle(title);
  const desc = clampDescription(description) || DEFAULT_DESCRIPTION;
  const ogImage = absoluteUrl(image || DEFAULT_OG_IMAGE);
  const blocks = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];
  const serializedBlocks = JSON.stringify(blocks);

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

  // Insertion effects run before paint and before layout effects, so crawlers
  // and the tab title never flash the index.html fallback.
  useInsertionEffect(() => {
    syncHead(ownerId, fullTitle, metas, canonical, JSON.parse(serializedBlocks));
    return () => {
      document.head.querySelectorAll(`[${OWNER}="${ownerId}"]`).forEach(node => node.remove());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownerId, fullTitle, desc, canonical, ogImage, type, noindex, serializedBlocks]);

  return null;
}
