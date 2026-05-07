import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, TrendingUp, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';
import { formatPrice, cleanProductName } from '../../lib/format';
import type { Product } from '../../types';

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

const TRENDING = ['Sofa', 'Chair', 'Table', 'Lamp', 'Bedroom'];

export function SearchModal({ open, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 250);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setQuery('');
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const { data, isFetching } = useProducts(
    debounced ? { search: debounced, limit: 8 } : undefined
  );

  const results = debounced ? (data?.data ?? []) : [];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-0 left-0 right-0 z-[70] bg-white shadow-2xl"
          >
            <div className="max-w-3xl mx-auto px-4 py-5">
              <div className="flex items-center gap-3">
                <Search size={22} className="text-brand-accent shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search for products..."
                  className="flex-1 bg-transparent text-lg text-brand-heading placeholder-gray-300 focus:outline-none"
                />
                {isFetching && debounced && <Loader2 size={18} className="animate-spin text-gray-300" />}
                <kbd className="hidden sm:inline-flex items-center px-2 py-1 text-[10px] font-bold text-gray-400 bg-gray-100 rounded">ESC</kbd>
                <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="border-t border-gray-100 max-h-[70vh] overflow-y-auto">
              <div className="max-w-3xl mx-auto px-4 py-4">
                {!debounced ? (
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <TrendingUp size={12} /> Trending searches
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {TRENDING.map(t => (
                        <button key={t} onClick={() => setQuery(t)}
                          className="px-4 py-2 text-sm bg-gray-100 hover:bg-brand-accent hover:text-white text-gray-600 rounded-full font-semibold transition-colors"
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : results.length === 0 && !isFetching ? (
                  <div className="text-center py-12 text-gray-400">
                    <Search size={32} className="mx-auto mb-3 opacity-30" />
                    <p className="font-semibold">No products match "{debounced}"</p>
                    <p className="text-xs mt-1">Try a different keyword</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                      {results.length} result{results.length !== 1 ? 's' : ''} for "{debounced}"
                    </p>
                    <AnimatePresence mode="popLayout">
                      {results.map((p, i) => (
                        <motion.div
                          key={p.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2, delay: i * 0.03 }}
                        >
                          <SearchResultItem product={p} onSelect={onClose} />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {results.length >= 8 && (
                      <Link to={`/products?search=${encodeURIComponent(debounced)}`} onClick={onClose}
                        className="block text-center py-3 text-sm font-bold text-brand-accent hover:bg-brand-accent/5 rounded-xl transition-colors mt-2"
                      >
                        See all results →
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function SearchResultItem({ product, onSelect }: { product: Product; onSelect: () => void }) {
  const price = product.discount_price ?? product.price;
  const img = product.images?.[0] ?? `https://placehold.co/64x64/f5f5f5/999?text=${encodeURIComponent(product.name)}`;
  return (
    <Link to={`/products/${product.id}`} onClick={onSelect}
      className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors group"
    >
      <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0">
        <img src={img} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-brand-heading line-clamp-1 group-hover:text-brand-accent transition-colors">{cleanProductName(product.name)}</p>
        <p className="text-xs text-gray-400 line-clamp-1">{(product as any).categories?.name ?? 'Product'}</p>
      </div>
      <div className="text-right shrink-0">
        {product.discount_price && (
          <p className="text-xs text-gray-300 line-through">{formatPrice(product.price)}</p>
        )}
        <p className="font-bold text-brand-accent">{formatPrice(price)}</p>
      </div>
    </Link>
  );
}
