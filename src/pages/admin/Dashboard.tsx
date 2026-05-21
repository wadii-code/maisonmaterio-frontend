import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { DollarSign, ShoppingBag, Clock, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { useDashboardStats } from '../../hooks/useOrders';
import { Skeleton } from '../../components/ui/Skeleton';
import { RevenueChart } from '../../components/admin/RevenueChart';
import { Link } from 'react-router-dom';
import { formatPrice } from '../../lib/format';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
};

export function AdminDashboard() {
  const { data: stats, isLoading } = useDashboardStats();

  const METRIC_CARDS = [
    {
      label: 'Revenu total',
      value: stats ? formatPrice(stats.total_revenue) : '—',
      icon: DollarSign,
      color: 'bg-emerald-500',
    },
    {
      label: "Commandes aujourd'hui",
      value: stats?.orders_today ?? '—',
      icon: ShoppingBag,
      color: 'bg-blue-500',
    },
    {
      label: 'Commandes en attente',
      value: stats?.pending_orders ?? '—',
      icon: Clock,
      color: 'bg-yellow-500',
    },
    {
      label: 'Stock faible',
      value: stats?.low_stock_items ?? '—',
      icon: AlertTriangle,
      color: 'bg-red-500',
    },
  ];

  return (
    <>
      <Helmet><title>Tableau de bord — Maison Materiau Admin</title></Helmet>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-black text-brand-heading text-center sm:text-left">Tableau de bord</h1>
          <p className="text-gray-400 text-sm mt-1">Bon retour&nbsp;! Voici ce qui se passe aujourd'hui.</p>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {METRIC_CARDS.map(({ label, value, icon: Icon, color }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${color}`}>
                  <Icon size={20} className="text-white" />
                </div>
              </div>
              {isLoading ? (
                <Skeleton className="h-8 w-24 mb-1" />
              ) : (
                <p className="text-2xl font-black text-brand-heading">{String(value)}</p>
              )}
              <p className="text-sm text-gray-400 mt-1">{label}</p>
            </motion.div>
          ))}
        </div>

        <RevenueChart />

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <h2 className="font-black text-brand-heading">Commandes récentes</h2>
            <Link to="/admin/orders" className="text-xs font-bold text-brand-accent hover:underline flex items-center gap-1">
              Voir tout <ArrowUpRight size={12} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12" />)}
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {['N° Commande', 'Client', 'Date', 'Total', 'Statut'].map(h => (
                      <th key={h} className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {stats?.recent_orders?.map(order => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-gray-400">
                        <Link to={`/admin/orders/${order.id}`} className="hover:text-brand-accent">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </Link>
                      </td>
                      <td className="px-6 py-4 font-semibold text-brand-heading">
                        {(order as any).profiles?.full_name ?? 'Invité'}
                      </td>
                      <td className="px-6 py-4 text-gray-400">
                        {new Date(order.created_at).toLocaleDateString('fr-MA')}
                      </td>
                      <td className="px-6 py-4 font-bold">{formatPrice(order.total_amount)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-full capitalize ${STATUS_COLORS[order.status]}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {!stats?.recent_orders?.length && (
                    <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">Aucune commande pour le moment</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Ajouter un produit', to: '/admin/products/new', color: 'bg-brand-accent' },
            { label: 'Voir les commandes', to: '/admin/orders', color: 'bg-blue-500' },
            { label: 'Gérer le stock', to: '/admin/products?filter=low-stock', color: 'bg-yellow-500' },
            { label: 'Voir la boutique', to: '/', color: 'bg-brand-dark', external: true },
          ].map(action => (
            <Link
              key={action.label}
              to={action.to}
              target={action.external ? '_blank' : undefined}
              className={`${action.color} text-white rounded-2xl p-5 text-sm font-bold hover:opacity-90 transition-opacity flex items-center justify-between gap-2`}
            >
              {action.label}
              <ArrowUpRight size={16} className="opacity-70" />
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}