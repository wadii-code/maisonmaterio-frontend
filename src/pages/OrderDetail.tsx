import { Helmet } from 'react-helmet-async';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Package, MapPin, Phone, Banknote, Clock, CheckCircle, Truck, XCircle, Ban } from 'lucide-react';
import { useOrder, useUpdateOrderStatus } from '../hooks/useOrders';
import { useAuthStore } from '../stores/authStore';
import { useI18n } from '../stores/i18nStore';
import { Button } from '../components/ui/Button';
import { formatPrice, cleanProductName } from '../lib/format';
import toast from 'react-hot-toast';
import type { OrderStatus } from '../types';

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
};

const TIMELINE: { id: OrderStatus; icon: any }[] = [
  { id: 'pending', icon: Clock },
  { id: 'processing', icon: Package },
  { id: 'shipped', icon: Truck },
  { id: 'delivered', icon: CheckCircle },
];

export function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { t } = useI18n();
  const { data: order, isLoading, error } = useOrder(id ?? '');
  const updateStatus = useUpdateOrderStatus();

  if (!user) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package size={48} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-bold mb-4">Please sign in</h2>
          <Button variant="primary" onClick={() => navigate('/auth')}>{t('nav.signIn')}</Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="pt-20 min-h-screen bg-brand-card">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-white rounded-3xl h-96 animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <XCircle size={48} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-bold text-brand-heading mb-2">Order not found</h2>
          <Button variant="primary" onClick={() => navigate('/account/orders')}>
            <ArrowLeft size={16} /> Back to orders
          </Button>
        </div>
      </div>
    );
  }

  const currentIdx = TIMELINE.findIndex(s => s.id === order.status);
  const isCancelled = order.status === 'cancelled';
  const canCancel = order.status === 'pending';

  const handleCancel = async () => {
    if (!confirm('Cancel this order? This cannot be undone.')) return;
    try {
      await updateStatus.mutateAsync({ id: order.id, status: 'cancelled', notes: 'Cancelled by customer' });
      toast.success('Order cancelled');
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to cancel order');
    }
  };

  return (
    <>
      <Helmet><title>Order #{order.id.slice(0, 8).toUpperCase()} — Maison Materio</title></Helmet>
      <div className="pt-20 min-h-screen bg-brand-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <Link to="/account/orders" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-brand-accent mb-6 transition-colors">
            <ArrowLeft size={16} /> Back to orders
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-6 lg:p-8 mb-6"
          >
            <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
              <div>
                <p className="text-xs font-mono text-gray-400">ORDER</p>
                <h1 className="text-2xl font-black text-brand-heading">#{order.id.slice(0, 8).toUpperCase()}</h1>
                <p className="text-sm text-gray-400 mt-1">
                  Placed {new Date(order.created_at).toLocaleString()}
                </p>
              </div>
              <span className={`px-4 py-1.5 text-xs font-black rounded-full capitalize ${STATUS_COLORS[order.status]}`}>
                {order.status}
              </span>
            </div>

            {/* Timeline */}
            {!isCancelled ? (
              <div className="relative py-4">
                <div className="absolute top-1/2 left-6 right-6 h-0.5 bg-gray-100 -translate-y-1/2" />
                <div
                  className="absolute top-1/2 left-6 h-0.5 bg-brand-accent -translate-y-1/2 transition-all duration-500"
                  style={{ width: `calc(${(currentIdx / (TIMELINE.length - 1)) * 100}% - ${currentIdx === TIMELINE.length - 1 ? '24px' : '0px'})` }}
                />
                <div className="relative flex justify-between">
                  {TIMELINE.map((step, i) => {
                    const Icon = step.icon;
                    const done = i <= currentIdx;
                    const active = i === currentIdx;
                    return (
                      <div key={step.id} className="flex flex-col items-center gap-2 z-10">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                          done ? 'bg-brand-accent text-white shadow-lg' : 'bg-white border-2 border-gray-200 text-gray-300'
                        } ${active ? 'ring-4 ring-brand-accent/20' : ''}`}>
                          <Icon size={18} />
                        </div>
                        <span className={`text-xs font-bold capitalize ${done ? 'text-brand-heading' : 'text-gray-400'}`}>
                          {step.id}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="py-4 px-5 bg-red-50 rounded-2xl flex items-center gap-3">
                <Ban size={20} className="text-red-500" />
                <div>
                  <p className="font-bold text-red-700">Order cancelled</p>
                  {order.notes && <p className="text-xs text-red-500 mt-0.5">{order.notes}</p>}
                </div>
              </div>
            )}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Items */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="lg:col-span-2 bg-white rounded-3xl p-6 lg:p-8"
            >
              <h3 className="font-black text-brand-heading mb-5">Items</h3>
              <div className="space-y-4">
                {order.order_items?.map(item => {
                  const color = (item.customization as any)?.color;
                  return (
                    <div key={item.id} className="flex gap-4 pb-4 border-b border-gray-50 last:border-0">
                      <Link to={`/products/${item.product_id}`} className="shrink-0">
                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100">
                          <img
                            src={item.products?.images?.[0] ?? `https://placehold.co/80x80/f5f5f5/999?text=P`}
                            alt={item.products?.name ?? ''}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link to={`/products/${item.product_id}`}
                          className="font-semibold text-brand-heading hover:text-brand-accent transition-colors line-clamp-2"
                        >
                          {cleanProductName(item.products?.name ?? 'Product')}
                        </Link>
                        {color && (
                          <div className="flex items-center gap-2 mt-1">
                            <span className="w-3 h-3 rounded-full border border-gray-300" style={{ backgroundColor: color.hex }} />
                            <span className="text-xs text-gray-500">{color.name}</span>
                          </div>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          Qty: <span className="font-bold text-brand-heading">{item.quantity}</span> · {formatPrice(item.price_at_time)} ea.
                        </p>
                      </div>
                      <p className="text-base font-black text-brand-heading shrink-0">
                        {formatPrice(item.price_at_time * item.quantity)}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100 space-y-2 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>{t('common.subtotal')}</span>
                  <span>{formatPrice(order.total_amount)}</span>
                </div>
                <div className="flex justify-between font-black text-base text-brand-heading pt-3 border-t border-gray-100">
                  <span>{t('common.total')}</span>
                  <span className="text-brand-accent">{formatPrice(order.total_amount)}</span>
                </div>
              </div>

              {canCancel && (
                <Button variant="outline" fullWidth className="mt-6 !text-red-500 !border-red-200 hover:!bg-red-50" onClick={handleCancel} loading={updateStatus.isPending}>
                  <Ban size={16} /> Cancel order
                </Button>
              )}
            </motion.div>

            {/* Address + payment */}
            <motion.aside
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-3xl p-6">
                <h4 className="font-bold text-brand-heading flex items-center gap-2 text-sm mb-3">
                  <MapPin size={14} className="text-brand-accent" /> Delivery Address
                </h4>
                <div className="text-sm text-gray-700 space-y-0.5">
                  <p className="font-semibold">{order.shipping_address.full_name}</p>
                  <p>{order.shipping_address.address_line1}</p>
                  {order.shipping_address.address_line2 && <p>{order.shipping_address.address_line2}</p>}
                  <p>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}</p>
                  <p>{order.shipping_address.country}</p>
                  {order.shipping_address.phone && (
                    <p className="flex items-center gap-1 text-gray-500 mt-2">
                      <Phone size={12} /> {order.shipping_address.phone}
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6">
                <h4 className="font-bold text-brand-heading flex items-center gap-2 text-sm mb-3">
                  <Banknote size={14} className="text-brand-accent" /> Payment
                </h4>
                <p className="text-sm text-brand-heading font-semibold">Cash on Delivery</p>
                <p className="text-xs text-gray-400 mt-1">
                  {order.payment_status === 'paid'
                    ? 'Paid on delivery'
                    : 'Pay when your order arrives'}
                </p>
                <span className={`inline-block mt-2 px-2.5 py-0.5 text-xs font-bold rounded-full capitalize ${
                  order.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {order.payment_status}
                </span>
              </div>
            </motion.aside>
          </div>
        </div>
      </div>
    </>
  );
}
