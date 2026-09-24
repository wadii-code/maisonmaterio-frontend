import { useId, useInsertionEffect, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { buildHeadTags, type MetaSpec, type SeoOptions } from '../../lib/seo';

/**
 * Head manager for this SPA.
 *
 * Replaces react-helmet-async, which silently stopped applying tags here (the
 * package is unmaintained and misbehaves under React 18 concurrent rendering).
 * A direct document.head sync is both simpler and deterministic.
 *
 * Render at most one <Seo> per route: the last one mounted wins.
 */

const OWNER = 'data-seo-owner';

function syncHead(ownerId: string, title: string, metas: MetaSpec[], canonical: string, jsonLd: object[]) {
  // Drop what this instance created last time and any prerendered JSON-LD;
  // existing meta tags (index.html, prerender) are overwritten below instead.
  document.head
    .querySelectorAll(`[${OWNER}="${ownerId}"], script[data-prerender]`)
    .forEach(node => node.remove());

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

interface SeoProps extends SeoOptions {
  children?: ReactNode;
}

export function Seo(props: SeoProps) {
  const { pathname } = useLocation();
  const ownerId = useId();

  const { title, metas, canonical, jsonLd } = buildHeadTags(props, pathname);
  const serializedMetas = JSON.stringify(metas);
  const serializedBlocks = JSON.stringify(jsonLd);

  // Insertion effects run before paint and before layout effects, so crawlers
  // and the tab title never flash the index.html fallback.
  useInsertionEffect(() => {
    syncHead(ownerId, title, JSON.parse(serializedMetas), canonical, JSON.parse(serializedBlocks));
    return () => {
      document.head.querySelectorAll(`[${OWNER}="${ownerId}"]`).forEach(node => node.remove());
    };
  }, [ownerId, title, canonical, serializedMetas, serializedBlocks]);

  return null;
}
