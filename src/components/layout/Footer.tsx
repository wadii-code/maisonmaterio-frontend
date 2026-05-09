import { Link } from 'react-router-dom';
import { Instagram, Twitter, Facebook, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import { useI18n } from '../../stores/i18nStore';

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="bg-brand-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Newsletter */}
        <div className="py-12 border-b border-white/10">
          <div className="max-w-xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-2">{t('footer.newsletterTitle')}</h3>
            <p className="text-gray-400 mb-6">{t('footer.newsletterSub')}</p>
            <form className="flex gap-2 max-w-md mx-auto" onSubmit={e => e.preventDefault()}>
              <input
                type="email"
                placeholder={t('footer.yourEmail')}
                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-full text-white placeholder-gray-400 focus:outline-none focus:border-brand-accent transition-colors text-sm"
              />
              <button type="submit" className="px-6 py-3 bg-brand-accent hover:bg-brand-orange text-white font-semibold rounded-full transition-colors text-sm shrink-0">
                {t('footer.subscribe')}
              </button>
            </form>
          </div>
        </div>

        {/* Links Grid */}
        <div className="py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <span className="text-2xl font-black tracking-tight text-white">SWIPO</span>
            <p className="mt-3 text-sm text-gray-400 leading-relaxed">
              {t('footer.tagline')}
            </p>
            <div className="flex gap-3 mt-5">
              {[Instagram, Twitter, Facebook, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="p-2 bg-white/10 hover:bg-brand-accent rounded-full transition-colors">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider mb-4 text-gray-300">{t('footer.shop')}</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {['New Arrivals', 'Best Sellers', 'Sale', 'Dining Chairs', 'Sofas', 'Tables'].map(l => (
                <li key={l}><Link to="/products" className="hover:text-white transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider mb-4 text-gray-300">{t('footer.rooms')}</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {['Living Room', 'Dining Room', 'Bedroom', 'Home Office', 'Outdoor', 'Kitchen'].map(l => (
                <li key={l}><Link to="/products" className="hover:text-white transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider mb-4 text-gray-300">{t('footer.contact')}</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-center gap-2"><Mail size={14} /><span>hello@swipo.ma</span></li>
              <li className="flex items-center gap-2"><Phone size={14} /><span>+212 6 00 00 00 00</span></li>
              <li className="flex items-start gap-2"><MapPin size={14} className="shrink-0 mt-0.5" /><span>Boulevard Mohammed V,<br />Casablanca, Morocco</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="py-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} SWIPO. {t('footer.rights')}</p>
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
