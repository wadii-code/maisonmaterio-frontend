import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Truck, ShoppingBag, Banknote, MapPin, Phone, ShieldCheck } from 'lucide-react';
import { useCartStore } from '../stores/cartStore';
import { useAuthStore } from '../stores/authStore';
import { useCreateOrder } from '../hooks/useOrders';
import { Button } from '../components/ui/Button';
import { formatPrice, cleanProductName } from '../lib/format';
import { calcOrderTotals } from '../lib/pricing';
import toast from 'react-hot-toast';

type Step = 'shipping' | 'review' | 'confirmation';

const STEPS = [
  { id: 'shipping', label: 'Shipping', icon: Truck },
  { id: 'review', label: 'Review & Place Order', icon: Banknote },
  { id: 'confirmation', label: 'Confirmed', icon: CheckCircle },
];

export function Checkout() {
  const { items, totalPrice, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const createOrder = useCreateOrder();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('shipping');
  const [shippingData, setShippingData] = useState({
    full_name: '', address_line1: '', address_line2: '', city: '', state: '', postal_code: '', country: 'Morocco', phone: '',
  });
  const [orderId, setOrderId] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-bold text-brand-heading mb-2">Sign in to checkout</h2>
          <Button variant="primary" onClick={() => navigate('/auth?redirect=/checkout')}>Sign In</Button>
        </div>
      </div>
    );
  }

  if (items.length === 0 && step !== 'confirmation') {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-bold text-brand-heading mb-2">Your cart is empty</h2>
          <Button variant="primary" onClick={() => navigate('/products')}>Shop Now</Button>
        </div>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    try {
      const order = await createOrder.mutateAsync({
        items: items.map(i => ({
          product_id: i.product.id,
          quantity: i.quantity,
          customization: i.customization?.color
            ? { color: i.customization.color, unitPrice: i.customization.unitPrice ?? null }
            : undefined,
        })),
        shipping_address: shippingData,
        payment_method: 'cod',
      });
      setOrderId(order.id);
      clearCart();
      setStep('confirmation');
      toast.success('Order placed! Pay on delivery.');
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to place order');
    }
  };

  const totals = calcOrderTotals(
    items.map(i => ({
      price: i.customization?.unitPrice ?? i.product.discount_price ?? i.product.price,
      quantity: i.quantity,
    }))
  );
  const { subtotal, total } = totals;

  return (
    <>
      <Helmet><title>Checkout — Maison Materiau</title></Helmet>
      <div className="pt-20 min-h-screen bg-brand-card">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          {/* Step progress */}
          <div className="flex items-center justify-center mb-8 lg:mb-12 overflow-x-auto pb-2">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const active = s.id === step;
              const done = STEPS.findIndex(st => st.id === step) > i;
              return (
                <div key={s.id} className="flex items-center shrink-0">
                  <div className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full transition-all ${
                    active ? 'bg-brand-dark text-white' : done ? 'bg-brand-accent text-white' : 'bg-white text-gray-400'
                  }`}>
                    <Icon size={14} />
                    <span className="text-xs sm:text-sm font-bold whitespace-nowrap">{s.label}</span>
                  </div>
                  {i < STEPS.length - 1 && <div className={`w-6 sm:w-12 h-px mx-1 sm:mx-2 ${done ? 'bg-brand-accent' : 'bg-gray-200'}`} />}
                </div>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            {step === 'confirmation' ? (
              <motion.div
                key="confirmation"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12 lg:py-16 bg-white rounded-3xl mx-auto max-w-2xl"
              >
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                  className="w-20 h-20 lg:w-24 lg:h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <CheckCircle size={40} className="text-emerald-500" />
                </motion.div>
                <h2 className="text-2xl lg:text-3xl font-black text-brand-heading mb-2 px-4">Order Confirmed!</h2>
                <p className="text-gray-500 mb-2 px-4">Thank you for your purchase.</p>
                <div className="bg-brand-card max-w-md mx-auto rounded-2xl p-5 my-6 mx-4">
                  <div className="flex items-center justify-center gap-2 text-brand-accent mb-2">
                    <Banknote size={20} />
                    <span className="font-bold">Cash on Delivery</span>
                  </div>
                  <p className="text-sm text-gray-600">Pay <span className="font-black text-brand-heading">{formatPrice(total)}</span> in cash when your order arrives.</p>
                </div>
                {orderId && <p className="text-sm text-gray-400 mb-8">Order ID: <span className="font-mono font-bold">{orderId.slice(0, 8).toUpperCase()}</span></p>}
                <div className="flex gap-3 justify-center flex-wrap px-4">
                  <Button variant="primary" onClick={() => navigate('/account/orders')}>Track Order</Button>
                  <Button variant="outline" onClick={() => navigate('/products')}>Continue Shopping</Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8"
              >
                {/* Form area */}
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-3xl p-6 lg:p-8">
                    {step === 'shipping' && (
                      <div className="space-y-5">
                        <div>
                          <h2 className="text-xl font-black text-brand-heading flex items-center gap-2">
                            <Truck size={22} className="text-brand-accent" /> Informations de livraison
                          </h2>
                          <p className="text-sm text-gray-400 mt-1">Où devons-nous livrer votre commande ?</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {[
                            { label: 'Nom complet', key: 'full_name', colSpan: 2, required: true },
                            { label: 'Téléphone (requis pour la livraison)', key: 'phone', colSpan: 2, required: true },
                            { label: 'Ville', key: 'city', colSpan: 2, required: true },
                            { label: 'Adresse (facultatif)', key: 'address_line1', colSpan: 2, required: false },
                            { label: "Complément d'adresse (facultatif)", key: 'address_line2', colSpan: 2, required: false },
                          ].map(field => (
                            <div key={field.key} className={field.colSpan === 2 ? 'sm:col-span-2' : ''}>
                              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                {field.label}{field.required && <span className="text-brand-accent ml-1">*</span>}
                              </label>
                              <input
                                type="text"
                                value={shippingData[field.key as keyof typeof shippingData]}
                                onChange={e => setShippingData(prev => ({ ...prev, [field.key]: e.target.value }))}
                                className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-brand-accent transition-colors text-sm"
                                placeholder={field.label.replace(' (facultatif)', '').replace(' (requis pour la livraison)', '')}
                              />
                            </div>
                          ))}
                        </div>
                        <Button variant="primary" size="lg" fullWidth onClick={() => setStep('review')}
                          disabled={!shippingData.full_name || !shippingData.city || !shippingData.phone}
                        >
                          Passer à la confirmation
                        </Button>
                      </div>
                    )}

                    {step === 'review' && (
                      <div className="space-y-6">
                        <div>
                          <h2 className="text-xl font-black text-brand-heading flex items-center gap-2">
                            <Banknote size={22} className="text-brand-accent" /> Cash on Delivery
                          </h2>
                          <p className="text-sm text-gray-400 mt-1">Pay in cash when your order is delivered to your door.</p>
                        </div>

                        {/* COD Info Card */}
                        <div className="bg-gradient-to-br from-brand-accent/10 to-brand-orange/5 border-2 border-brand-accent/30 rounded-2xl p-5">
                          <div className="flex items-start gap-4">
                            <div className="p-3 bg-brand-accent rounded-xl text-white shrink-0">
                              <Banknote size={22} />
                            </div>
                            <div>
                              <h3 className="font-black text-brand-heading mb-1">Cash on Delivery</h3>
                              <p className="text-sm text-gray-600 mb-3">
                                The only payment method we accept. Have <span className="font-bold text-brand-heading">{formatPrice(total)}</span> ready when our courier arrives.
                              </p>
                              <div className="flex flex-wrap gap-3 text-xs">
                                <span className="flex items-center gap-1 bg-white/80 px-2.5 py-1 rounded-full">
                                  <ShieldCheck size={12} className="text-emerald-500" /> No upfront payment
                                </span>
                                <span className="flex items-center gap-1 bg-white/80 px-2.5 py-1 rounded-full">
                                  <ShieldCheck size={12} className="text-emerald-500" /> Inspect before paying
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Shipping Address Review */}
                        <div className="bg-brand-card rounded-2xl p-5">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-bold text-brand-heading flex items-center gap-2 text-sm">
                              <MapPin size={14} className="text-brand-accent" /> Adresse de livraison
                            </h4>
                            <button onClick={() => setStep('shipping')} className="text-xs font-bold text-brand-accent hover:underline">
                              Modifier
                            </button>
                          </div>
                          <div className="text-sm text-gray-700 space-y-0.5">
                            <p className="font-semibold">{shippingData.full_name}</p>
                            {shippingData.address_line1 && <p>{shippingData.address_line1}</p>}
                            {shippingData.address_line2 && <p>{shippingData.address_line2}</p>}
                            <p>{shippingData.city}</p>
                            {shippingData.phone && <p className="flex items-center gap-1 text-gray-500 mt-1"><Phone size={12} /> {shippingData.phone}</p>}
                          </div>
                        </div>

                        <div className="flex gap-3 flex-col sm:flex-row">
                          <Button variant="outline" onClick={() => setStep('shipping')} className="flex-1">Back</Button>
                          <Button variant="primary" size="lg" onClick={handlePlaceOrder} loading={createOrder.isPending} className="flex-1">
                            Place Order · {formatPrice(total)}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="space-y-4">
                  <div className="bg-white rounded-3xl p-6 lg:sticky lg:top-24">
                    <h3 className="font-black text-brand-heading mb-5">Order Summary</h3>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {items.map(item => {
                        const unit = item.customization?.unitPrice ?? item.product.discount_price ?? item.product.price;
                        const color = item.customization?.color;
                        return (
                        <div key={item.key} className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0 relative">
                            <img
                              src={item.product.images?.[0] ?? `https://placehold.co/56x56/f5f5f5/999?text=${encodeURIComponent(item.product.name)}`}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute -top-1 -right-1 bg-brand-dark text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                              {item.quantity}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-brand-heading line-clamp-1">{cleanProductName(item.product.name)}</p>
                            {color && (
                              <span className="inline-flex items-center gap-1 text-[11px] text-gray-500">
                                <span className="w-2.5 h-2.5 rounded-full border border-gray-300" style={{ backgroundColor: color.hex }} />
                                {color.name}
                              </span>
                            )}
                            <p className="text-xs text-gray-400">{formatPrice(unit)} ea.</p>
                          </div>
                          <p className="text-sm font-bold shrink-0">
                            {formatPrice(unit * item.quantity)}
                          </p>
                        </div>
                        );
                      })}
                    </div>
                    <div className="mt-5 pt-5 border-t border-gray-100 space-y-2 text-sm">
                      <div className="flex justify-between text-gray-500">
                        <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
                      </div>
                      <div className="flex justify-between font-black text-base text-brand-heading pt-3 border-t border-gray-100">
                        <span>Total to Pay</span><span className="text-brand-accent">{formatPrice(total)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
