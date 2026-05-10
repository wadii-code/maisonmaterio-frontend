import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import { supabase } from './lib/supabase';
import { useAuthStore } from './stores/authStore';
import { useWishlistStore } from './stores/wishlistStore';
import { ScrollToTop } from './components/layout/ScrollToTop';
import { useI18nStore } from './stores/i18nStore';

// Layout
import { Layout } from './components/layout/Layout';
import { AdminLayout } from './components/admin/AdminLayout';

// Customer pages
import { useParams } from 'react-router-dom';
import { Home } from './pages/Home';
import { Products } from './pages/Products';
import { ProductDetail } from './pages/ProductDetail';
import { Checkout } from './pages/Checkout';
import { Auth } from './pages/Auth';
import { Account } from './pages/Account';
import { Wishlist } from './pages/Wishlist';
import { About } from './pages/About';
import { ProfileSettings } from './pages/ProfileSettings';
import { SavedAddresses } from './pages/SavedAddresses';
import { Personalize } from './pages/Personalize';
import { OrderDetail } from './pages/OrderDetail';

// Admin pages
import { AdminDashboard } from './pages/admin/Dashboard';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminCustomers } from './pages/admin/AdminCustomers';
import { AdminReviews } from './pages/admin/AdminReviews';
import { AdminCategories } from './pages/admin/AdminCategories';

// Forces ProductDetail to remount when the product id changes,
// so all local state (image gallery, qty, customization, scroll) resets
function ProductDetailRoute() {
  const { id } = useParams<{ id: string }>();
  return <ProductDetail key={id} />;
}

export default function App() {
  const setSession = useAuthStore(s => s.setSession);
  const hydrateWishlist = useWishlistStore(s => s.hydrate);
  const locale = useI18nStore(s => s.locale);

  // Keep <html lang> in sync with the chosen locale.
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      hydrateWishlist(session?.user?.id ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      hydrateWishlist(session?.user?.id ?? null);
    });
    return () => subscription.unsubscribe();
  }, [setSession, hydrateWishlist]);

  return (
    <HelmetProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { borderRadius: '12px', fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: '600' },
        }}
      />
      <ScrollToTop />
      <Routes>
        {/* Customer routes */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetailRoute />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/account" element={<Account />} />
          <Route path="/account/orders" element={<Account />} />
          <Route path="/account/orders/:id" element={<OrderDetail />} />
          <Route path="/account/profile" element={<ProfileSettings />} />
          <Route path="/account/addresses" element={<SavedAddresses />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/about" element={<About />} />
          <Route path="/personalize" element={<Personalize />} />
          <Route path="/auth/reset-password" element={<Auth />} />
        </Route>

        {/* Admin routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/new" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="orders/:id" element={<AdminOrders />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="categories" element={<AdminCategories />} />
        </Route>
      </Routes>
    </HelmetProvider>
  );
}
