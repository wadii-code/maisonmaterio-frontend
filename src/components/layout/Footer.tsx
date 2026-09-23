import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import { useI18n } from '../../stores/i18nStore';
import { useCategories, useRooms } from '../../hooks/useProducts';
import { STORE } from '../../lib/seo';

export function Footer() {
  const { t } = useI18n();
  const { data: categories } = useCategories();
  const { data: rooms } = useRooms();
  return (
    <footer className="bg-brand-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Newsletter */}
        <div className="py-12 border-b border-white/10">
          <div className="max-w-xl mx-auto text-center">
            
          </div>
        </div>

        {/* Links Grid */}
        <div className="py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <span className="text-2xl font-black tracking-tight text-white">Maison Materiau</span>
            <p className="mt-3 text-sm text-gray-400 leading-relaxed">
              {t('footer.tagline')}
            </p>
          </div>

          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider mb-4 text-gray-300">{t('footer.shop')}</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/products" className="hover:text-white transition-colors">Tous les produits</Link></li>
              <li><Link to="/products?tags=NEW" className="hover:text-white transition-colors">Nouveautés</Link></li>
              <li><Link to="/products?sort=review_count&order=desc" className="hover:text-white transition-colors">Meilleures ventes</Link></li>
              {categories?.slice(0, 4).map(cat => (
                <li key={cat.id}>
                  <Link to={`/products?category=${cat.slug}`} className="hover:text-white transition-colors">{cat.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider mb-4 text-gray-300">{t('footer.rooms')}</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {rooms?.slice(0, 5).map(room => (
                <li key={room.id}>
                  <Link to={`/products?room=${room.slug}`} className="hover:text-white transition-colors">{room.name}</Link>
                </li>
              ))}
              <li><Link to="/personalize" className="hover:text-white transition-colors">Sur mesure</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">À propos</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider mb-4 text-gray-300">{t('footer.contact')}</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-center gap-2">
                <Mail size={14} />
                <a href={`mailto:${STORE.email}`} className="hover:text-white transition-colors">{STORE.email}</a>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={14} />
                <a href={`tel:${STORE.phone}`} className="hover:text-white transition-colors">{STORE.phoneDisplay}</a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={14} className="shrink-0 mt-0.5" />
                <address className="not-italic">{STORE.street},<br />{STORE.city}, Maroc</address>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="py-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Maison Materiau. {t('footer.rights')}</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-gray-300">{t('footer.privacy')}</a>
            <a href="#" className="hover:text-gray-300">{t('footer.terms')}</a>
            <a href="#" className="hover:text-gray-300">{t('footer.cookies')}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
