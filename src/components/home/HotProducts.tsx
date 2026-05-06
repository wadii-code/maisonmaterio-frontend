import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useProducts } from '../../hooks/useProducts';
import { ProductCard } from '../product/ProductCard';
import { ProductCardSkeleton } from '../ui/Skeleton';
import type { Product } from '../../types';

const TABS = [
  { label: 'Latest Products', sort: 'created_at', order: 'desc' },
  { label: 'Top Rating', sort: 'rating', order: 'desc' },
  { label: 'Best Sellers', sort: 'review_count', order: 'desc' },
];

const FALLBACK_PRODUCTS: Product[] = [
  {
    id: '1', name: 'Chair Padded Seat', slug: 'chair-padded-seat', description: 'Comfortable padded chair', price: 100, discount_price: 80,
    category_id: '1', stock: 15, status: 'active', images: ['https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=400&q=80'],
    tags: ['SALE'], rating: 4, review_count: 2, created_at: '', updated_at: '',
  },
  {
    id: '2', name: 'Briarwood Decorative 2', slug: 'briarwood-decorative-2', description: 'Modern decorative chair', price: 400, discount_price: 25,
    category_id: '1', stock: 8, status: 'active', images: ['https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&q=80'],
    tags: ['HOT'], rating: 0, review_count: 0, created_at: '', updated_at: '',
  },
  {
    id: '3', name: 'Aqua Globes 2', slug: 'aqua-globes-2', description: 'Elegant aqua globe chair', price: 400, discount_price: 25,
    category_id: '1', stock: 5, status: 'active', images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80'],
    tags: ['HOT', 'NEW'], rating: 0, review_count: 0, created_at: '', updated_at: '',
  },
  {
    id: '4', name: 'Aqua Globes', slug: 'aqua-globes', description: 'Classic aqua globe design', price: 30, discount_price: undefined,
    category_id: '1', stock: 22, status: 'active', images: ['https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=400&q=80'],
    tags: ['HOT'], rating: 0, review_count: 0, created_at: '', updated_at: '',
  },
];

export function HotProducts() {
  const [activeTab, setActiveTab] = useState(0);
  const tab = TABS[activeTab];
  const { data, isLoading } = useProducts({ sort: tab.sort, order: tab.order, limit: 8 });
  const products = data?.data?.length ? data.data : FALLBACK_PRODUCTS;

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-6">
          <div>
            <h2 className="text-3xl lg:text-4xl font-black text-brand-heading">
              Hot <span className="text-brand-accent">Products</span>
            </h2>
            <div className="w-12 h-1 bg-brand-accent mt-3 rounded-full" />
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-full">
            {TABS.map((t, i) => (
              <button
                key={t.label}
                onClick={() => setActiveTab(i)}
                className={`relative px-4 py-2 text-xs font-bold rounded-full transition-all ${
                  activeTab === i ? 'text-brand-heading' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {activeTab === i && (
                  <motion.div layoutId="tab-bg" className="absolute inset-0 bg-white rounded-full shadow-sm" />
                )}
                <span className="relative z-10">{t.label}</span>
              </button>
            ))}
          </div>

          <Link to="/products" className="hidden sm:flex items-center gap-2 text-sm font-bold border border-gray-300 text-brand-text hover:border-brand-accent hover:text-brand-accent px-4 py-2 rounded-full transition-all">
            All products <ArrowRight size={14} />
          </Link>
        </div>

        {/* Products grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6"
          >
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : products.slice(0, 8).map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
