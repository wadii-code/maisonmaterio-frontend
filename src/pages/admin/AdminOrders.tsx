import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { ChevronDown, Search, Eye, X } from 'lucide-react';
import { useOrders, useUpdateOrderStatus, useOrder } from '../../hooks/useOrders';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { formatPrice, cleanProductName } from '../../lib/format';
import toast from 'react-hot-toast';
import type { OrderStatus } from '../../types';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
};

const STATUS_OPTIONS: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export function AdminOrders() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [search, setSearch] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const { data, isLoading } = useOrders(statusFilter ? { status: statusFilter, page: String(page) } : { page: String(page) });
  const { data: selectedOrder } = useOrder(selectedOrderId ?? '');
  const updateStatus = useUpdateOrderStatus();

  const orders = data?.data ?? [];

  const STATUS_LABELS: Record<OrderStatus, string> = {
    pending: 'En attente',
    processing: 'En traitement',
    shipped: 'Expédiée',
    delivered: 'Livrée',
    cancelled: 'Annulée',
  };

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    setUpdatingId(orderId);
    try {
      await updateStatus.mutateAsync({ id: orderId, status });
      toast.success(`Statut mis à jour&nbsp;: ${STATUS_LABELS[status]}`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleTogglePayment = async (orderId: string, currentlyPaid: boolean) => {
    setUpdatingId(orderId);
    try {
      await updateStatus.mutateAsync({ id: orderId, payment_status: currentlyPaid ? 'pending' : 'paid' });
      toast.success(currentlyPaid ? 'Marqué comme impayé' : 'Marqué comme payé');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <>
      <Helmet><title>Commandes — SWIPO Admin</title></Helmet>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-black text-brand-heading">Commandes</h1>
            <p className="text-gray-400 text-sm mt-0.5">{data?.pagination?.total ?? 0} commandes au total</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 flex gap-4 flex-wrap items-center">
          <div className="relative flex-1 min-w-48">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text" placeholder="Rechercher des commandes…"
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-accent"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setStatusFilter('')}
              className={`px-4 py-2 text-xs font-bold rounded-full transition-all ${!statusFilter ? 'bg-brand-dark text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
            >Tous</button>
            {STATUS_OPTIONS.map(s => (
              <button key={s} onClick={() => setStatusFilter(s === statusFilter ? '' : s)}
                className={`px-4 py-2 text-xs font-bold rounded-full transition-all ${statusFilter === s ? 'bg-brand-dark text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
              >{STATUS_LABELS[s]}</button>
            ))}
          </div>
        </div>

        {/* Table + Detail pane */}
        <div className="flex gap-6">
          <div className={`bg-white rounded-2xl shadow-sm overflow-hidden flex-1 ${selectedOrderId ? 'xl:flex-none xl:w-1/2' : ''}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {['N° Commande', 'Client', 'Date', 'Total', 'Paiement', 'Statut', 'Actions'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {isLoading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                      <tr key={i}><td colSpan={7} className="px-4 py-3"><Skeleton className="h-10" /></td></tr>
                    ))
                  ) : orders.map(order => (
                    <tr key={order.id}
                      className={`hover:bg-gray-50 transition-colors cursor-pointer ${selectedOrderId === order.id ? 'bg-brand-accent/5' : ''}`}
                      onClick={() => setSelectedOrderId(order.id === selectedOrderId ? null : order.id)}
                    >
                      <td className="px-4 py-4 font-mono text-xs text-gray-400">#{order.id.slice(0, 8).toUpperCase()}</td>
                      <td className="px-4 py-4 font-semibold text-brand-heading">{order.profiles?.full_name ?? 'Invité'}</td>
                      <td className="px-4 py-4 text-gray-400 whitespace-nowrap">{new Date(order.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-4 font-bold">{formatPrice(order.total_amount)}</td>
                      <td className="px-4 py-4">
                        <button
                          onClick={e => { e.stopPropagation(); handleTogglePayment(order.id, order.payment_status === 'paid'); }}
                          disabled={updatingId === order.id}
                          title={order.payment_status === 'paid' ? 'Cliquer pour marquer comme impayé' : 'Cliquer pour marquer comme payé'}
                          className={`px-2.5 py-0.5 text-xs font-bold rounded-full capitalize cursor-pointer hover:opacity-80 transition-opacity disabled:opacity-50 ${
                            order.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {order.payment_status === 'paid' ? 'payé' : order.payment_status === 'pending' ? 'en attente' : order.payment_status === 'failed' ? 'échoué' : 'remboursé'}
                        </button>
                      </td>
                      <td className="px-4 py-4">
                        <div className="relative" onClick={e => e.stopPropagation()}>
                          <select
                            value={order.status}
                            onChange={e => handleStatusChange(order.id, e.target.value as OrderStatus)}
                            disabled={updatingId === order.id}
                            className={`appearance-none pl-3 pr-8 py-1.5 text-xs font-bold rounded-full border-0 cursor-pointer transition-all ${STATUS_COLORS[order.status]}`}
                          >
                            {STATUS_OPTIONS.map(s => (
                              <option key={s} value={s} className="bg-white text-gray-800">{STATUS_LABELS[s]}</option>
                            ))}
                          </select>
                          <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <button onClick={e => { e.stopPropagation(); setSelectedOrderId(order.id === selectedOrderId ? null : order.id); }}
                          className="p-2 text-gray-400 hover:text-brand-accent hover:bg-gray-100 rounded-lg transition-all"
                        >
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!isLoading && orders.length === 0 && (
                    <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400">Aucune commande trouvée</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            {data?.pagination && data.pagination.pages > 1 && (
              <div className="flex justify-center gap-2 px-6 py-4 border-t border-gray-100">
                {Array.from({ length: data.pagination.pages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-full text-sm font-semibold transition-all ${p === page ? 'bg-brand-dark text-white' : 'hover:bg-gray-100'}`}
                  >{p}</button>
                ))}
              </div>
            )}
          </div>

          {/* Order Detail Panel */}
          {selectedOrderId && selectedOrder && (
            <motion.div
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              className="hidden xl:block w-96 bg-white rounded-2xl shadow-sm p-6 h-fit sticky top-24 space-y-5"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-black text-brand-heading">Détails de la commande</h3>
                <button onClick={() => setSelectedOrderId(null)} className="p-1.5 hover:bg-gray-100 rounded-full">
                  <X size={16} />
                </button>
              </div>
              <div className="text-xs space-y-2 bg-gray-50 rounded-xl p-4">
                <p className="font-mono text-gray-400">#{selectedOrder.id}</p>
                <p className="font-semibold">{selectedOrder.profiles?.full_name}</p>
                <p className="text-gray-500">{new Date(selectedOrder.created_at).toLocaleString()}</p>
              </div>
              <div className="space-y-3">
                {selectedOrder.order_items?.map(item => {
                  const color = (item.customization as any)?.color;
                  return (
                  <div key={item.id} className="flex gap-3 items-center">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      <img src={item.products?.images?.[0] ?? 'https://placehold.co/48x48/f5f5f5/999?text=P'}
                        alt={item.products?.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold line-clamp-1">{item.products?.name}</p>
                      {color && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-gray-500">
                          <span className="w-2.5 h-2.5 rounded-full border border-gray-300" style={{ backgroundColor: color.hex }} />
                          {color.name}
                        </span>
                      )}
                      <p className="text-xs text-gray-400">Qté&nbsp;: {item.quantity} · {formatPrice(item.price_at_time)}</p>
                    </div>
                    <p className="text-sm font-bold shrink-0">{formatPrice(item.price_at_time * item.quantity)}</p>
                  </div>
                  );
                })}
              </div>
              <div className="border-t pt-4 space-y-1 text-sm">
                <div className="flex justify-between font-black">
                  <span>Total</span>
                  <span className="text-brand-accent">{formatPrice(selectedOrder.total_amount)}</span>
                </div>
              </div>
              {selectedOrder.shipping_address && (
                <div className="text-xs text-gray-500 bg-gray-50 rounded-xl p-4 space-y-1">
                  <p className="font-bold text-gray-700 mb-2">Adresse de livraison</p>
                  <p>{selectedOrder.shipping_address.full_name}</p>
                  <p>{selectedOrder.shipping_address.address_line1}</p>
                  <p>{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} {selectedOrder.shipping_address.postal_code}</p>
                  <p>{selectedOrder.shipping_address.country}</p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}
