import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Sofa } from 'lucide-react';
import { useCategories } from '../../hooks/useProducts';
import { Skeleton } from '../ui/Skeleton';

export function Categories() {
  const { data: categories, isLoading } = useCategories();
  const displayCategories = (categories ?? []).slice(0, 6);

  if (!isLoading && displayCategories.length === 0) return null;

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-4">
          <div>
            <h2 className="text-3xl lg:text-4xl font-black text-brand-heading">
              Shop by <span className="text-brand-accent">categories</span>
            </h2>
            <div className="w-12 h-1 bg-brand-accent mt-3 rounded-full" />
            <div className="flex items-center gap-2 mt-4 text-gray-500">
              <Sofa size={18} className="text-brand-accent" />
              <span className="text-sm">200+ Unique products</span>
            </div>
          </div>
          <Link to="/products" className="flex items-center gap-2 text-sm font-bold text-brand-accent hover:gap-3 transition-all uppercase tracking-wider">
            All Categories <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="aspect-square" />)
            : displayCategories.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
              >
                <Link
                  to={`/products?category=${cat.slug}`}
                  className="group block bg-brand-card rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300"
                >
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={(cat as any).image_url ?? `https://placehold.co/200x200/f5f5f5/999?text=${encodeURIComponent(cat.name)}`}
                      alt={cat.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-3 text-center">
                    <p className="text-xs font-bold text-brand-heading group-hover:text-brand-accent transition-colors">{cat.name}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
        </div>
      </div>
    </section>
  );
}
