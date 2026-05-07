import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Mounted once at the app root. Watches every route change and scrolls the
 * window back to the top — without this, navigating between similarly-shaped
 * pages can leave the viewport mid-scroll and *look* like the page didn't render.
 *
 * Also dispatches a custom event so global listeners (e.g. close drawers/modals)
 * can react to navigation if needed.
 */
export function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    window.dispatchEvent(new CustomEvent('route-changed', { detail: { pathname, search } }));
  }, [pathname, search]);

  return null;
}
