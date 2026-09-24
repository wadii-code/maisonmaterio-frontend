import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import type { Crumb } from '../../lib/structuredData';

export { breadcrumbJsonLd, type Crumb } from '../../lib/structuredData';

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Fil d'Ariane">
      <ol className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-400 overflow-x-auto whitespace-nowrap">
        {items.map((crumb, i) => (
          <li key={`${crumb.label}-${i}`} className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            {crumb.to ? (
              <Link to={crumb.to} className="hover:text-brand-accent transition-colors">
                {crumb.label}
              </Link>
            ) : (
              <span className="text-brand-text font-medium truncate" aria-current="page">
                {crumb.label}
              </span>
            )}
            {i < items.length - 1 && <ChevronRight size={12} aria-hidden="true" className="shrink-0" />}
          </li>
        ))}
      </ol>
    </nav>
  );
}
