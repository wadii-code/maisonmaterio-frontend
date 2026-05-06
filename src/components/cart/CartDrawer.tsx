import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, ShoppingBag, ArrowRight, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../../stores/cartStore';
import { Button } from '../ui/Button';

export function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, totalPrice, totalItems } = useCartStore();

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <ShoppingBag size={22} className="text-brand-accent" />
                <h2 className="text-lg font-bold text-brand-heading">Your Cart</h2>
                <span className="bg-brand-accent text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {totalItems()}
                </span>
              </div>
              <button onClick={closeCart} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              <AnimatePresence>
                {items.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center h-64 text-gray-400"
                  >
                    <ShoppingBag size={48} className="mb-3 opacity-30" />
                    <p className="text-base font-medium">Your cart is empty</p>
                    <p className="text-sm mt-1">Add some products to get started</p>
                    <Button variant="outline" size="sm" className="mt-4" onClick={closeCart}>
                      Continue Shopping
                    </Button>
                  </motion.div>
                ) : (
                  items.map((item) => {
                    const price = item.product.discount_price ?? item.product.price;
                    const img = item.product.images?.[0] ?? `https://placehold.co/80x80/f5f5f5/999?text=${encodeURIComponent(item.product.name)}`;
                    return (
                      <motion.div
                        key={item.product.id}
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex gap-4 p-3 bg-gray-50 rounded-xl"
                      >
                        <img src={img} alt={item.product.name} className="w-20 h-20 object-cover rounded-lg bg-gray-100 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-brand-heading line-clamp-2">{item.product.name}</h4>
                          <p className="text-brand-accent font-bold text-sm mt-1">${(price * item.quantity).toFixed(2)}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="p-1 rounded-full bg-white border border-gray-200 hover:border-brand-accent transition-colors"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              disabled={item.quantity >= item.product.stock}
                              className="p-1 rounded-full bg-white border border-gray-200 hover:border-brand-accent transition-colors disabled:opacity-50"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>
                        <button
                          onClick={() => removeItem(item.product.id)}
                          className="text-gray-300 hover:text-red-500 transition-colors p-1 self-start"
                        >
                          <Trash2 size={16} />
                        </button>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="px-6 py-5 border-t border-gray-100 space-y-4 bg-white">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-xl font-bold text-brand-heading">${totalPrice().toFixed(2)}</span>
                </div>
                <p className="text-xs text-gray-400">Shipping & taxes calculated at checkout</p>
                <Link to="/checkout" onClick={closeCart}>
                  <Button variant="primary" size="lg" fullWidth>
                    Checkout <ArrowRight size={18} />
                  </Button>
                </Link>
                <button onClick={closeCart} className="w-full text-sm text-gray-500 hover:text-brand-text transition-colors">
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
