import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Minus, Plus, ChevronRight, Truck, Shield, RotateCcw, Banknote } from 'lucide-react';
import { useProduct, useProducts } from '../hooks/useProducts';
import { useReviewEligibility, useCreateReview } from '../hooks/useReviews';
import { useCartStore } from '../stores/cartStore';
import { useWishlistStore } from '../stores/wishlistStore';
import { useAuthStore } from '../stores/authStore';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { StarRating } from '../components/ui/StarRating';
import { ProductCard } from '../components/product/ProductCard';
import { ProductCustomization } from '../components/product/ProductCustomization';
import { ProductReviews } from '../components/product/ProductReviews';
import { Skeleton } from '../components/ui/Skeleton';
import toast from 'react-hot-toast';

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading, error } = useProduct(id!);
  const { data: related } = useProducts(
    product?.categories?.slug ? { category: product.categories.slug, limit: 8 } : undefined
  );
  const addItem = useCartStore(s => s.addItem);
  const toggleWishlist = useWishlistStore(s => s.toggle);
  const isInWishlist = useWishlistStore(s => (id ? s.has(id) : false));
  const { user } = useAuthStore();
  const { data: eligibility } = useReviewEligibility(id ?? '', !!user && !!id);
  const createReview = useCreateReview(id ?? '');
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [customization, setCustomization] = useState<{ selections: Record<string, string>; price: number }>({ selections: {}, price: 0 });

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior }); }, [id]);

  if (isLoading) {
    return (
      <div className="pt-20 max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
        <Skeleton className="aspect-square" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="pt-20 flex flex-col items-center justify-center min-h-[60vh] text-gray-400 px-4">
        <p className="text-xl font-semibold">Product not found</p>
        <Link to="/products" className="mt-4 text-brand-accent underline">Browse all products</Link>
      </div>
    );
  }

  const images = product.images?.length
    ? product.images
    : [`https://placehold.co/600x600/f5f5f5/999?text=${encodeURIComponent(product.name)}`];

  const basePrice = product.discount_price ?? product.price;
  const discount = product.discount_price
    ? Math.round((1 - product.discount_price / product.price) * 100)
    : null;
  const finalPrice = customization.price || basePrice;

  const handleAddToCart = () => {
    addItem({ ...product, price: finalPrice, discount_price: null }, quantity);
    toast.success(`${product.name} added to cart!`, {
      style: { borderRadius: '50px', fontWeight: '600' },
      iconTheme: { primary: '#f5a623', secondary: '#fff' },
    });
  };

  const handleSubmitReview = async (rating: number, comment: string) => {
    await createReview.mutateAsync({ rating, comment });
  };

  return (
    <>
      <Helmet>
        <title>{product.name} — SWIPO</title>
        <meta name="description" content={product.description} />
      </Helmet>
      <div className="pt-20 min-h-screen">
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-400 overflow-x-auto whitespace-nowrap">
            <Link to="/" className="hover:text-brand-accent transition-colors">Home</Link>
            <ChevronRight size={12} />
            <Link to="/products" className="hover:text-brand-accent transition-colors">Shop</Link>
            <ChevronRight size={12} />
            <span className="text-brand-text font-medium truncate">{product.name}</span>
          </div>
        </div>

        {/* Main content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 lg:pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-20">
            {/* Image Gallery */}
            <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
              <motion.div
                key={selectedImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="aspect-square bg-brand-card rounded-3xl overflow-hidden"
              >
                <img
                  src={images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </motion.div>
              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                        selectedImage === i ? 'border-brand-accent' : 'border-transparent'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Badges */}
              <div className="flex gap-2 flex-wrap">
                {discount && <Badge label={`-${discount}% OFF`} color="red" />}
                {product.tags.includes('HOT') && <Badge label="HOT" color="orange" />}
                {product.tags.includes('NEW') && <Badge label="NEW" color="green" />}
                {product.stock <= 5 && product.stock > 0 && <Badge label={`Only ${product.stock} left`} color="red" />}
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-brand-heading leading-tight">{product.name}</h1>

              <StarRating rating={product.rating} count={product.review_count} size="md" />

              {/* Price */}
              <motion.div
                key={finalPrice}
                initial={{ scale: 1.05 }}
                animate={{ scale: 1 }}
                className="flex items-baseline gap-3 flex-wrap"
              >
                <span className="text-3xl sm:text-4xl font-black text-brand-accent">${finalPrice.toFixed(2)}</span>
                {product.discount_price && finalPrice === basePrice && (
                  <span className="text-lg sm:text-xl text-gray-400 line-through">${product.price.toFixed(2)}</span>
                )}
              </motion.div>

              <p className="text-gray-600 leading-relaxed text-sm sm:text-base">{product.description}</p>

              {/* Customization */}
              <div className="bg-brand-card rounded-2xl p-5">
                <h3 className="text-sm font-black text-brand-heading mb-4">Customize Your Order</h3>
                <ProductCustomization
                  basePrice={basePrice}
                  onChange={(selections, price) => setCustomization({ selections, price })}
                />
              </div>

              {/* Specs */}
              {(product.material || product.dimensions) && (
                <div className="bg-brand-card rounded-2xl p-5 space-y-3">
                  {product.material && (
                    <div className="flex items-start gap-3 text-sm">
                      <span className="text-gray-400 w-24 shrink-0">Material</span>
                      <span className="font-semibold text-brand-heading">{product.material}</span>
                    </div>
                  )}
                  {product.dimensions && (
                    <div className="flex items-start gap-3 text-sm">
                      <span className="text-gray-400 w-24 shrink-0">Dimensions</span>
                      <span className="font-semibold text-brand-heading">{product.dimensions}</span>
                    </div>
                  )}
                  <div className="flex items-start gap-3 text-sm">
                    <span className="text-gray-400 w-24 shrink-0">Stock</span>
                    <span className={`font-semibold ${product.stock > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                    </span>
                  </div>
                </div>
              )}

              {/* Quantity + Add to Cart */}
              {product.stock > 0 && (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                  <div className="flex items-center justify-between sm:justify-start border-2 border-gray-200 rounded-full overflow-hidden">
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="px-5 font-bold text-lg min-w-[50px] text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                      className="px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <Button variant="primary" size="lg" onClick={handleAddToCart} className="flex-1">
                    <ShoppingCart size={20} /> Add to Cart · ${(finalPrice * quantity).toFixed(2)}
                  </Button>
                  <motion.button
                    onClick={() => {
                      const added = toggleWishlist(product);
                      toast.success(added ? 'Added to wishlist' : 'Removed from wishlist', {
                        icon: added ? '❤️' : '💔',
                        style: { borderRadius: '50px', fontWeight: '600' },
                      });
                    }}
                    whileTap={{ scale: 0.85 }}
                    className={`hidden sm:flex p-4 border-2 rounded-full transition-colors items-center justify-center ${
                      isInWishlist
                        ? 'bg-red-500 border-red-500 text-white'
                        : 'border-gray-200 hover:border-red-400 hover:text-red-400'
                    }`}
                    aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    <Heart size={20} className={isInWishlist ? 'fill-white' : ''} />
                  </motion.button>
                </div>
              )}

              {/* Guarantees */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-4 border-t border-gray-100">
                {[
                  { icon: Banknote, label: 'Cash on Delivery', sub: 'Pay when you receive' },
                  { icon: Truck, label: 'Free Shipping', sub: 'On orders over $100' },
                  { icon: RotateCcw, label: '30-Day Returns', sub: 'Easy & free returns' },
                  { icon: Shield, label: '2-Year Warranty', sub: 'On all products' },
                ].map(({ icon: Icon, label, sub }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="p-2 bg-brand-accent/10 rounded-lg shrink-0">
                      <Icon size={16} className="text-brand-accent" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-brand-heading">{label}</p>
                      <p className="text-[11px] text-gray-400">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Reviews */}
          <ProductReviews
            productId={product.id}
            rating={product.rating}
            reviewCount={product.review_count}
            reviews={product.reviews}
            isLoggedIn={!!user}
            hasPurchased={eligibility?.has_purchased ?? false}
            hasReviewed={eligibility?.has_reviewed ?? false}
            onSubmit={handleSubmitReview}
          />

          {/* Related Products */}
          {related?.data && related.data.filter(p => p.id !== product.id).length > 0 && (
            <div className="mt-16 lg:mt-20">
              <h2 className="text-2xl font-black text-brand-heading mb-6 lg:mb-8">You may also like</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
                {related.data.filter(p => p.id !== product.id).slice(0, 4).map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
