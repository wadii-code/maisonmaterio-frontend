import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import { useI18n } from '../../stores/i18nStore';

export function Footer() {
  const { t } = useI18n();
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
              {['Nouveautés', 'Meilleures ventes', 'Soldes', 'Chaises de salle à manger', 'Canapés', 'Tables'].map(l => (
                <li key={l}><Link to="/products" className="hover:text-white transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider mb-4 text-gray-300">{t('footer.rooms')}</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {['Salon', 'Salle à manger', 'Chambre', 'Bureau', 'Extérieur', 'Cuisine'].map(l => (
                <li key={l}><Link to="/products" className="hover:text-white transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider mb-4 text-gray-300">{t('footer.contact')}</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-center gap-2"><Mail size={14} /><span>maisonmateriau@gmail.com</span></li>
              <li className="flex items-center gap-2"><Phone size={14} /><span>+212 645-104432</span></li>
              <li className="flex items-start gap-2"><MapPin size={14} className="shrink-0 mt-0.5" /><span>Boulevard Mohammed V,<br />Casablanca, Maroc</span></li>
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
