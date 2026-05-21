import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Package } from 'lucide-react';
import { useProducts } from '../../hooks/useProducts';
import { ProductCard } from '../product/ProductCard';
import { ProductCardSkeleton } from '../ui/Skeleton';

const TABS = [
  { label: 'Nouveautés', sort: 'created_at', order: 'desc' },
  { label: 'Mieux notés', sort: 'rating', order: 'desc' },
  { label: 'Meilleures ventes', sort: 'review_count', order: 'desc' },
];

export function HotProducts() {
  const [activeTab, setActiveTab] = useState(0);
  const tab = TABS[activeTab];
  const { data, isLoading } = useProducts({ sort: tab.sort, order: tab.order, limit: 8 });
  const products = data?.data ?? [];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-6">
          <div>
            <h2 className="text-3xl lg:text-4xl font-black text-brand-heading">
              Produits <span className="text-brand-accent">Populaires</span>
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
            Tous les produits <ArrowRight size={14} />
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
              : products.length === 0
                ? (
                  <div className="col-span-full bg-brand-card rounded-2xl p-12 text-center text-gray-400">
                    <Package size={32} className="mx-auto mb-3 opacity-30" />
                    <p className="font-semibold">Aucun produit disponible pour le moment</p>
                    <Link to="/admin/products/new" className="text-sm mt-1 text-brand-accent hover:underline inline-block">Ajoutez votre premier produit →</Link>
                  </div>
                )
                : products.slice(0, 8).map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} />
                ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
