import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, User, Search, Menu, X, ChevronDown, Heart } from 'lucide-react';
import { useCartStore } from '../../stores/cartStore';
import { useAuthStore } from '../../stores/authStore';
import { useWishlistStore } from '../../stores/wishlistStore';
import { useI18n } from '../../stores/i18nStore';
import { SearchModal } from './SearchModal';

function useNavLinks() {
  const { t } = useI18n();
  return [
    { label: t('nav.home'), to: '/' },
    { label: t('nav.shop'), to: '/products' },
    {
      label: t('nav.rooms'), to: '#',
      children: [
        { label: t('nav.livingRoom'), to: '/products?room=living-room' },
        { label: t('nav.diningRoom'), to: '/products?room=dining-room' },
        { label: t('nav.bedroom'), to: '/products?room=bedroom' },
        { label: t('nav.office'), to: '/products?room=office' },
      ],
    },
    { label: t('nav.about'), to: '/about' },
    { label: t('nav.personalize'), to: '/personalize' },
  ];
}

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const location = useLocation();
  const isHome = location.pathname === '/';
  const { toggleCart, totalItems } = useCartStore();
  const { user, profile, signOut } = useAuthStore();
  const wishlistCount = useWishlistStore(s => s.items.length);
  const cartCount = totalItems();
  const { t } = useI18n();
  const NAV_LINKS = useNavLinks();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location]);

  const isTransparent = isHome && !scrolled;

  return (
    <header className={`fixed top-0 left-0 right-0 z-30 transition-all duration-300 ${
      isTransparent ? 'bg-transparent' : 'bg-white shadow-md'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <span className={`text-2xl font-black tracking-tight transition-colors ${isTransparent ? 'text-white' : 'text-brand-dark'}`}>
              SWIPO
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map(link => (
              <div key={link.label} className="relative"
                onMouseEnter={() => link.children && setActiveDropdown(link.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  to={link.to}
                  className={`flex items-center gap-1 text-sm font-semibold transition-colors hover:text-brand-accent ${
                    isTransparent ? 'text-white/90 hover:text-white' : 'text-brand-text'
                  }`}
                >
                  {link.label}
                  {link.children && <ChevronDown size={14} />}
                </Link>
                {link.children && (
                  <AnimatePresence>
                    {activeDropdown === link.label && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="absolute top-full left-0 mt-2 w-48 bg-white shadow-xl rounded-xl border border-gray-100 py-2 z-50"
                      >
                        {link.children.map(child => (
                          <Link key={child.label} to={child.to}
                            className="block px-4 py-2 text-sm text-brand-text hover:text-brand-accent hover:bg-gray-50 transition-colors"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 lg:gap-3">
            <button
              onClick={() => setSearchOpen(true)}
              aria-label={t('nav.search')}
              className={`p-2 rounded-full hover:bg-white/10 transition-colors ${isTransparent ? 'text-white' : 'text-brand-text'}`}
            >
              <Search size={20} />
            </button>

            <Link
              to="/wishlist"
              aria-label="Wishlist"
              className={`relative p-2 rounded-full hover:bg-white/10 transition-colors ${isTransparent ? 'text-white' : 'text-brand-text'}`}
            >
              <Heart size={20} className={wishlistCount > 0 ? 'fill-red-500 text-red-500' : ''} />
              <AnimatePresence>
                {wishlistCount > 0 && (
                  <motion.span
                    key={wishlistCount}
                    initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center"
                  >
                    {wishlistCount > 99 ? '99+' : wishlistCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>

            <button
              onClick={toggleCart}
              className={`relative p-2 rounded-full hover:bg-white/10 transition-colors ${isTransparent ? 'text-white' : 'text-brand-text'}`}
            >
              <ShoppingCart size={20} />
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 bg-brand-accent text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center"
                  >
                    {cartCount > 99 ? '99+' : cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            {user ? (
              <UserMenu isTransparent={isTransparent} profile={profile} signOut={signOut} />
            ) : (
              <Link to="/auth" className={`hidden lg:flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full border transition-all ${
                isTransparent
                  ? 'border-white/50 text-white hover:bg-white hover:text-brand-dark'
                  : 'border-brand-accent text-brand-accent hover:bg-brand-accent hover:text-white'
              }`}>
                {t('nav.signIn')}
              </Link>
            )}

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={`lg:hidden p-2 rounded-full transition-colors ${isTransparent ? 'text-white' : 'text-brand-text'}`}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t border-gray-100 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {NAV_LINKS.map(link => (
                <Link key={link.label} to={link.to}
                  className="block px-4 py-3 text-sm font-semibold text-brand-text hover:text-brand-accent hover:bg-gray-50 rounded-lg transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <hr className="my-2" />
              {user ? (
                <>
                  <Link to="/account" className="block px-4 py-3 text-sm font-semibold text-brand-text hover:bg-gray-50 rounded-lg">{t('nav.myAccount')}</Link>
                  <button onClick={signOut} className="block w-full text-left px-4 py-3 text-sm font-semibold text-red-500 hover:bg-gray-50 rounded-lg">{t('nav.signOut')}</button>
                </>
              ) : (
                <Link to="/auth" className="block px-4 py-3 text-sm font-semibold text-brand-accent hover:bg-gray-50 rounded-lg">{t('nav.signInRegister')}</Link>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}

interface UserMenuProps {
  isTransparent: boolean;
  profile: any;
  signOut: () => Promise<void>;
}

function UserMenu({ isTransparent, profile, signOut }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-user-menu]')) setOpen(false);
    };
    if (open) {
      document.addEventListener('click', onClickOutside);
      return () => document.removeEventListener('click', onClickOutside);
    }
  }, [open]);

  return (
    <div className="relative hidden lg:block" data-user-menu>
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-2 p-2 rounded-full hover:bg-white/10 transition-colors ${isTransparent ? 'text-white' : 'text-brand-text'}`}
      >
        <User size={20} />
        <span className="text-sm font-medium hidden xl:block">{profile?.full_name?.split(' ')[0]}</span>
        {profile?.role === 'admin' && (
          <span className="hidden xl:inline-block w-1.5 h-1.5 bg-brand-accent rounded-full" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-56 bg-white shadow-xl rounded-2xl border border-gray-100 py-2 z-50 overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-bold text-brand-heading truncate">{profile?.full_name ?? 'Account'}</p>
              {profile?.role === 'admin' && (
                <span className="inline-block mt-1 px-2 py-0.5 bg-brand-accent text-white text-[10px] font-black rounded uppercase tracking-wider">Admin</span>
              )}
            </div>
            <Link to="/account" onClick={() => setOpen(false)} className="block px-4 py-2.5 text-sm text-brand-text hover:text-brand-accent hover:bg-gray-50 transition-colors">{t('nav.myAccount')}</Link>
            <Link to="/account/orders" onClick={() => setOpen(false)} className="block px-4 py-2.5 text-sm text-brand-text hover:text-brand-accent hover:bg-gray-50 transition-colors">{t('nav.myOrders')}</Link>
            <Link to="/wishlist" onClick={() => setOpen(false)} className="block px-4 py-2.5 text-sm text-brand-text hover:text-brand-accent hover:bg-gray-50 transition-colors">{t('nav.myWishlist')}</Link>
            {profile?.role === 'admin' && (
              <Link to="/admin" onClick={() => setOpen(false)}
                className="flex items-center gap-2 mx-2 my-1 px-3 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-brand-accent to-brand-orange rounded-xl hover:opacity-90 transition-opacity"
              >
                <span>🛠️</span> {t('nav.adminDashboard')}
              </Link>
            )}
            <hr className="my-1 border-gray-100" />
            <button onClick={() => { setOpen(false); signOut(); }}
              className="block w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
            >
              {t('nav.signOut')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
