import { motion } from 'framer-motion';
import { ShoppingCart, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '../ui/Badge';
import { StarRating } from '../ui/StarRating';
import { CountdownTimer } from '../ui/CountdownTimer';
import { useCartStore } from '../../stores/cartStore';
import { useWishlistStore } from '../../stores/wishlistStore';
import { formatPrice, cleanProductName } from '../../lib/format';
import type { Product } from '../../types';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
  index?: number;
}

const SALE_END = new Date(Date.now() + 259 * 24 * 60 * 60 * 1000);

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const addItem = useCartStore(s => s.addItem);
  const toggleWishlist = useWishlistStore(s => s.toggle);
  const isInWishlist = useWishlistStore(s => s.has(product.id));
  const discount = product.discount_price && product.price
    ? Math.round((1 - product.discount_price / product.price) * 100)
    : null;

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const added = toggleWishlist(product);
    toast.success(added ? `${product.name} added to wishlist` : `Removed from wishlist`, {
      icon: added ? '❤️' : '💔',
      style: { borderRadius: '50px', fontWeight: '600' },
    });
  };

  const primaryImage = product.images?.[0] ?? `https://placehold.co/400x400/f5f5f5/999?text=${encodeURIComponent(product.name)}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ y: -4 }}
      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300"
    >
      <Link to={`/products/${product.id}`} className="block relative overflow-hidden aspect-square bg-brand-card">
        <img
          src={primaryImage}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {discount && <Badge label={`-${discount}%`} color="red" />}
          {product.tags.includes('HOT') && <Badge label="HOT" color="orange" />}
          {product.tags.includes('NEW') && <Badge label="NEW" color="green" />}
        </div>
        {/* Quick add overlay */}
        <motion.button
          onClick={(e) => { e.preventDefault(); addItem(product); }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="absolute bottom-3 right-3 bg-brand-accent text-white p-2.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          aria-label="Add to cart"
        >
          <ShoppingCart size={16} />
        </motion.button>
        <motion.button
          onClick={handleWishlist}
          whileTap={{ scale: 0.85 }}
          aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`absolute top-3 right-3 p-2 rounded-full shadow-sm transition-all duration-200 ${
            isInWishlist
              ? 'bg-red-500 text-white opacity-100'
              : 'bg-white text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100'
          }`}
        >
          <Heart size={14} className={isInWishlist ? 'fill-white' : ''} />
        </motion.button>
      </Link>

      <div className="p-4 space-y-2">
        {product.tags.includes('SALE') || discount ? (
          <CountdownTimer endDate={SALE_END} />
        ) : null}
        <StarRating rating={product.rating} count={product.review_count} />
        <Link to={`/products/${product.id}`}>
          <h3 className="text-sm font-semibold text-brand-heading line-clamp-2 hover:text-brand-accent transition-colors">
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
      </div>
    </motion.div>
  );
}
