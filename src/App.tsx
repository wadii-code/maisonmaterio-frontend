import { useEffect, lazy, Suspense, type ReactNode } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { supabase } from './lib/supabase';
import { useAuthStore } from './stores/authStore';
import { useWishlistStore } from './stores/wishlistStore';
import { ScrollToTop } from './components/layout/ScrollToTop';
import { useI18nStore } from './stores/i18nStore';

// Layout
import { Layout } from './components/layout/Layout';

// Pages people land on from search stay eager; the rest load on demand.
import { useParams } from 'react-router-dom';
import { Home } from './pages/Home';
import { Products } from './pages/Products';
import { ProductDetail } from './pages/ProductDetail';
import { About } from './pages/About';
import { Personalize } from './pages/Personalize';

const Checkout = lazy(() => import('./pages/Checkout').then(m => ({ default: m.Checkout })));
const Auth = lazy(() => import('./pages/Auth').then(m => ({ default: m.Auth })));
const Account = lazy(() => import('./pages/Account').then(m => ({ default: m.Account })));
const Wishlist = lazy(() => import('./pages/Wishlist').then(m => ({ default: m.Wishlist })));
const ProfileSettings = lazy(() => import('./pages/ProfileSettings').then(m => ({ default: m.ProfileSettings })));
const SavedAddresses = lazy(() => import('./pages/SavedAddresses').then(m => ({ default: m.SavedAddresses })));
const OrderDetail = lazy(() => import('./pages/OrderDetail').then(m => ({ default: m.OrderDetail })));

const AdminLayout = lazy(() => import('./components/admin/AdminLayout').then(m => ({ default: m.AdminLayout })));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard').then(m => ({ default: m.AdminDashboard })));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts').then(m => ({ default: m.AdminProducts })));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders').then(m => ({ default: m.AdminOrders })));
const AdminCustomers = lazy(() => import('./pages/admin/AdminCustomers').then(m => ({ default: m.AdminCustomers })));
const AdminReviews = lazy(() => import('./pages/admin/AdminReviews').then(m => ({ default: m.AdminReviews })));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories').then(m => ({ default: m.AdminCategories })));
const AdminAdmins = lazy(() => import('./pages/admin/AdminAdmins').then(m => ({ default: m.AdminAdmins })));

function Page({ children }: { children: ReactNode }) {
  return <Suspense fallback={<div className="min-h-screen" />}>{children}</Suspense>;
}

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
    <>
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
          <Route path="/checkout" element={<Page><Checkout /></Page>} />
          <Route path="/auth" element={<Page><Auth /></Page>} />
          <Route path="/account" element={<Page><Account /></Page>} />
          <Route path="/account/orders" element={<Page><Account /></Page>} />
          <Route path="/account/orders/:id" element={<Page><OrderDetail /></Page>} />
          <Route path="/account/profile" element={<Page><ProfileSettings /></Page>} />
          <Route path="/account/addresses" element={<Page><SavedAddresses /></Page>} />
          <Route path="/wishlist" element={<Page><Wishlist /></Page>} />
          <Route path="/about" element={<About />} />
          <Route path="/personalize" element={<Personalize />} />
          <Route path="/auth/reset-password" element={<Page><Auth /></Page>} />
        </Route>

        {/* Admin routes */}
        <Route path="/admin" element={<Page><AdminLayout /></Page>}>
          <Route index element={<Page><AdminDashboard /></Page>} />
          <Route path="products" element={<Page><AdminProducts /></Page>} />
          <Route path="products/new" element={<Page><AdminProducts /></Page>} />
          <Route path="orders" element={<Page><AdminOrders /></Page>} />
          <Route path="orders/:id" element={<Page><AdminOrders /></Page>} />
          <Route path="customers" element={<Page><AdminCustomers /></Page>} />
          <Route path="reviews" element={<Page><AdminReviews /></Page>} />
          <Route path="categories" element={<Page><AdminCategories /></Page>} />
          <Route path="admins" element={<Page><AdminAdmins /></Page>} />
          {/* Unknown /admin/* path → dashboard */}
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>

        {/* Any unknown path falls back to the home page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
