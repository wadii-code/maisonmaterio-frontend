import { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Package, FolderTree, ShoppingBag, Users, Star, LogOut, Menu, X, ShieldAlert, RefreshCw, LogIn } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../ui/Button';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Tableau de bord', to: '/admin' },
  { icon: Package, label: 'Produits', to: '/admin/products' },
  { icon: FolderTree, label: 'Catégories', to: '/admin/categories' },
  { icon: ShoppingBag, label: 'Commandes', to: '/admin/orders' },
  { icon: Users, label: 'Clients', to: '/admin/customers' },
  { icon: Star, label: 'Avis', to: '/admin/reviews' },
];

export function AdminLayout() {
  const { user, profile, profileError, signOut, initialized, refreshProfile } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Always refetch profile when entering /admin so a freshly-promoted role takes effect
  // without requiring a sign-out / sign-in cycle.
  useEffect(() => {
    if (user) {
      setRefreshing(true);
      refreshProfile().finally(() => setRefreshing(false));
    }
  }, [user, refreshProfile]);

  // Loading state
  if (!initialized || refreshing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-brand-accent border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-sm text-gray-500 font-semibold">Vérification de l'accès administrateur…</p>
        </div>
      </div>
    );
  }

  // Not signed in
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center shadow-sm">
          <div className="w-16 h-16 bg-brand-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn size={28} className="text-brand-accent" />
          </div>
          <h2 className="text-2xl font-black text-brand-heading mb-2">Connexion requise</h2>
          <p className="text-sm text-gray-500 mb-6">Vous devez être connecté en tant qu'administrateur pour accéder à cette page.</p>
          <Button variant="primary" fullWidth onClick={() => navigate('/auth?redirect=/admin')}>
            Se connecter
          </Button>
        </div>
      </div>
    );
  }

  // Signed in but not admin — show clear message
  if (profile?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center shadow-sm">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldAlert size={28} className="text-red-500" />
          </div>
          <h2 className="text-2xl font-black text-brand-heading mb-2">Accès administrateur requis</h2>
          <p className="text-sm text-gray-500 mb-1">
            Vous êtes connecté en tant que <span className="font-bold text-brand-heading">{profile?.full_name ?? user.email}</span>
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Rôle actuel&nbsp;: <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-xs">{profile?.role ?? 'inconnu'}</span>
          </p>

          {profileError ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-left">
              <p className="text-xs font-bold text-red-700 mb-2">⚠ Erreur de récupération du profil</p>
              <p className="text-xs text-red-700 break-words font-mono">{profileError}</p>
              <p className="text-xs text-red-700 mt-3 font-semibold">Cause probable&nbsp;: ligne de profil manquante ou RLS bloquant la lecture.</p>
              <p className="text-xs text-red-700 mt-2">Exécutez ceci dans l'éditeur SQL Supabase&nbsp;:</p>
              <code className="block mt-1 bg-red-100 p-2 rounded text-[10px] break-all">
                INSERT INTO profiles (id, role, full_name) VALUES ('{user.id}', 'admin', 'Admin') ON CONFLICT (id) DO UPDATE SET role = 'admin';
              </code>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-left">
              <p className="text-xs font-bold text-amber-700 mb-2">Si vous venez de vous promouvoir dans Supabase&nbsp;:</p>
              <ol className="text-xs text-amber-700 space-y-1 list-decimal list-inside">
                <li>Cliquez sur «&nbsp;Actualiser le profil&nbsp;» ci-dessous — pas besoin de se déconnecter</li>
                <li>Ou déconnectez-vous puis reconnectez-vous</li>
                <li>Vérifiez dans Supabase&nbsp;:</li>
              </ol>
              <code className="block mt-2 bg-amber-100 p-2 rounded text-[10px] break-all">
                SELECT role FROM profiles WHERE id = '{user.id}';
              </code>
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate('/')} className="flex-1">
              Retour à la boutique
            </Button>
            <Button
              variant="primary"
              loading={refreshing}
              onClick={async () => {
                setRefreshing(true);
                const updated = await refreshProfile();
                setRefreshing(false);
                if (updated?.role !== 'admin') {
                  // Stay on this page — message will show updated role
                }
              }}
              className="flex-1"
            >
              <RefreshCw size={14} /> Actualiser le profil
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 w-64 bg-brand-dark text-white flex flex-col z-50 transform transition-transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <Link to="/" className="text-xl font-black">SWIPO</Link>
          <span className="text-xs bg-brand-accent px-2 py-0.5 rounded font-bold">Admin</span>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/60 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {NAV_ITEMS.map(({ icon: Icon, label, to }) => {
            const active = location.pathname === to || (to !== '/admin' && location.pathname.startsWith(to));
            return (
              <Link
                key={to} to={to}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  active ? 'bg-brand-accent text-white' : 'text-white/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                {active && <motion.div layoutId="admin-nav-indicator" className="absolute left-0 w-1 h-8 bg-white rounded-r-full" />}
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-9 h-9 bg-brand-accent/20 rounded-full flex items-center justify-center text-sm font-bold text-brand-accent">
              {profile.full_name?.[0]?.toUpperCase() ?? 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{profile.full_name}</p>
              <p className="text-xs text-white/40">Administrateur</p>
            </div>
          </div>
          <button
            onClick={async () => { await signOut(); navigate('/'); }}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-all"
          >
            <LogOut size={16} /> Déconnexion
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500 hover:text-brand-dark">
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2 text-sm text-gray-400 flex-1">
            <Link to="/admin" className="hover:text-brand-dark">Admin</Link>
            {location.pathname !== '/admin' && (
              <>
                <span>/</span>
                <span className="text-brand-heading font-semibold capitalize">
                  {location.pathname.split('/admin/')[1]?.split('/')[0]}
                </span>
              </>
            )}
          </div>
          <Link to="/" target="_blank" className="text-xs font-semibold text-gray-400 hover:text-brand-accent transition-colors">
            Voir la boutique ↗
          </Link>
        </header>

        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
