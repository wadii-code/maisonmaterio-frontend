import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, User, MapPin, LogOut, ChevronRight, Clock } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useOrders } from '../hooks/useOrders';
import { Button } from '../components/ui/Button';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
};

export function Account() {
  const { user, profile, signOut } = useAuthStore();
  const navigate = useNavigate();
  const { data: ordersData, isLoading } = useOrders();
  const orders = ordersData?.data ?? [];

  if (!user) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <User size={48} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-bold mb-4">Please sign in to view your account</h2>
          <Button variant="primary" onClick={() => navigate('/auth')}>Sign In</Button>
        </div>
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <>
      <Helmet><title>My Account — SWIPO</title></Helmet>
      <div className="pt-20 min-h-screen bg-brand-card">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl p-6 text-center"
              >
                <div className="w-20 h-20 bg-brand-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User size={32} className="text-brand-accent" />
                </div>
                <h3 className="font-black text-brand-heading">{profile?.full_name ?? 'Customer'}</h3>
                <p className="text-sm text-gray-400 mt-1">{user.email}</p>
                {profile?.role === 'admin' && (
                  <span className="inline-block mt-2 px-3 py-1 bg-brand-accent text-white text-xs font-bold rounded-full">Admin</span>
                )}
              </motion.div>

              <nav className="bg-white rounded-3xl p-3 space-y-1">
                {[
                  { icon: Package, label: 'My Orders', href: '/account/orders' },
                  { icon: User, label: 'Profile Settings', href: '/account/settings' },
                  { icon: MapPin, label: 'Saved Addresses', href: '/account/addresses' },
                ].map(({ icon: Icon, label, href }) => (
                  <Link key={href} to={href}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-brand-text hover:text-brand-accent hover:bg-gray-50 rounded-xl transition-all"
                  >
                    <Icon size={16} />
                    {label}
                    <ChevronRight size={14} className="ml-auto" />
                  </Link>
                ))}
                {profile?.role === 'admin' && (
                  <Link to="/admin" className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-brand-accent hover:bg-gray-50 rounded-xl transition-all">
                    <Package size={16} /> Admin Dashboard <ChevronRight size={14} className="ml-auto" />
                  </Link>
                )}
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 rounded-xl transition-all"
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </nav>
            </div>

            {/* Orders list */}
            <div className="lg:col-span-3">
              <h2 className="text-2xl font-black text-brand-heading mb-6">Order History</h2>
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl h-24 animate-pulse" />
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center">
                  <Package size={48} className="mx-auto text-gray-200 mb-4" />
                  <p className="font-semibold text-gray-400">No orders yet</p>
                  <Button variant="primary" size="sm" className="mt-4" onClick={() => navigate('/products')}>Start Shopping</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map(order => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-2xl p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div>
                          <p className="text-xs font-mono text-gray-400">#{order.id.slice(0, 8).toUpperCase()}</p>
                          <p className="font-bold text-brand-heading mt-1">${order.total_amount.toFixed(2)}</p>
                          <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                            <Clock size={12} /> {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 text-xs font-bold rounded-full capitalize ${STATUS_COLORS[order.status]}`}>
                            {order.status}
                          </span>
                          <Link to={`/account/orders/${order.id}`}
                            className="text-xs font-bold text-brand-accent hover:underline"
                          >
                            View details
                          </Link>
                        </div>
                      </div>
                      {order.order_items && order.order_items.length > 0 && (
                        <div className="mt-4 flex gap-2 overflow-x-auto">
                          {order.order_items.slice(0, 4).map(item => (
                            <div key={item.id} className="w-12 h-12 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                              <img
                                src={item.products?.images?.[0] ?? `https://placehold.co/48x48/f5f5f5/999?text=P`}
                                alt={item.products?.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                          {order.order_items.length > 4 && (
                            <div className="w-12 h-12 shrink-0 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-400">
                              +{order.order_items.length - 4}
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
