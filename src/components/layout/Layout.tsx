import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { CartDrawer } from '../cart/CartDrawer';
import { AdminFloatingButton } from './AdminFloatingButton';

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-brand-bg font-sans">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <AdminFloatingButton />
    </div>
  );
}
