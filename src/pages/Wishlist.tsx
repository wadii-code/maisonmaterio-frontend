import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, X, ArrowRight } from 'lucide-react';
import { useWishlistStore } from '../stores/wishlistStore';
import { useCartStore } from '../stores/cartStore';
import { Button } from '../components/ui/Button';
import { StarRating } from '../components/ui/StarRating';
import { Badge } from '../components/ui/Badge';
import { formatPrice, cleanProductName } from '../lib/format';
import toast from 'react-hot-toast';

export function Wishlist() {
  const { items, remove, clear } = useWishlistStore();
  const addToCart = useCartStore(s => s.addItem);
  const navigate = useNavigate();

  const handleAddToCart = (product: any) => {
    addToCart(product);
    toast.success('Ajouté au panier', { icon: '🛒', style: { borderRadius: '50px', fontWeight: '600' } });
  };

  const handleClearAll = () => {
    if (!items.length) return;
    if (!confirm(`Retirer tous les ${items.length} articles de votre liste de souhaits ?`)) return;
    clear();
    toast.success('Liste de souhaits vidée');
  };

  return (
    <>
      <Helmet><title>Ma liste de souhaits — Maison Materio</title></Helmet>
      <div className="pt-20 min-h-screen bg-white">
        <div className="bg-brand-card py-10 lg:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-black text-brand-heading flex items-center gap-3">
                <Heart size={28} className="text-red-500 fill-red-500" />
                Ma liste de souhaits
              </h1>
              <p className="text-gray-500 mt-2 text-sm">
                {items.length} {items.length === 1 ? 'article enregistré' : 'articles enregistrés'}
              </p>
            </div>
            {items.length > 0 && (
              <button
                onClick={handleClearAll}
                className="flex items-center gap-1.5 text-sm font-bold text-red-500 hover:bg-red-50 px-4 py-2 rounded-full transition-colors"
              >
                <Trash2 size={14} /> Tout effacer
              </button>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          {items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-brand-card rounded-3xl py-16 px-6 text-center max-w-xl mx-auto"
            >
              <motion.div
                initial={{ y: 0 }}
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="inline-block mb-4"
              >
                <Heart size={48} className="text-gray-300 mx-auto" />
              </motion.div>
              <h2 className="text-xl font-black text-brand-heading mb-2">Your wishlist is empty</h2>
              <p className="text-sm text-gray-400 mb-6">
                Tap the heart icon on any product to save it for later.
              </p>
              <Button variant="primary" onClick={() => navigate('/products')}>
                Browse Products <ArrowRight size={16} />
              </Button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
              <AnimatePresence mode="popLayout">
                {items.map((product, i) => {
                  const price = product.discount_price ?? product.price;
                  const discount = product.discount_price && product.price
                    ? Math.round((1 - product.discount_price / product.price) * 100)
                    : null;
                  const img = product.images?.[0]
                    ?? `https://placehold.co/400x400/f5f5f5/999?text=${encodeURIComponent(product.name)}`;
                  return (
                    <motion.div
                      key={product.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ y: -4 }}
                      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow"
                    >
                      <Link to={`/products/${product.id}`} className="block relative aspect-square bg-brand-card overflow-hidden">
                        <img
                          src={img}
                          alt={product.name}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3 flex flex-col gap-1">
                          {discount && <Badge label={`-${discount}%`} color="red" />}
                          {product.tags?.includes('HOT') && <Badge label="HOT" color="orange" />}
                          {product.tags?.includes('NEW') && <Badge label="NEW" color="green" />}
                        </div>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            remove(product.id);
                            toast.success('Removed from wishlist', { icon: '💔', style: { borderRadius: '50px', fontWeight: '600' } });
                          }}
                          className="absolute top-3 right-3 bg-white text-gray-500 hover:text-red-500 hover:bg-red-50 p-2 rounded-full shadow-sm transition-all"
                          aria-label="Remove from wishlist"
                        >
                          <X size={14} />
                        </button>
                      </Link>

                      <div className="p-4 space-y-2">
                        {product.review_count > 0 && (
                          <StarRating rating={product.rating} count={product.review_count} />
                        )}
                        <Link to={`/products/${product.id}`}>
                          <h3 className="text-sm font-semibold text-brand-heading line-clamp-2 hover:text-brand-accent transition-colors min-h-[2.5rem]">
                            {cleanProductName(product.name)}
                          </h3>
                        </Link>
                        <div className="flex items-center gap-2 flex-wrap">
                          {product.discount_price ? (
                            <>
                              <span className="text-gray-400 line-through text-xs">{formatPrice(product.price)}</span>
                              <span className="text-brand-accent font-bold text-sm">{formatPrice(product.discount_price)}</span>
                            </>
                          ) : (
                            <span className="text-brand-heading font-bold text-sm">{formatPrice(product.price)}</span>
                          )}
                        </div>
                        <Button
                          variant="primary"
                          fullWidth
                          size="sm"
                          onClick={() => handleAddToCart(product)}
                          disabled={product.stock <= 0}
                        >
                          <ShoppingCart size={14} />
                          {product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
