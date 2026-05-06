import { useState, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, ChevronDown, X, Package } from 'lucide-react';
import { useProducts, useCategories } from '../hooks/useProducts';
import { ProductCard } from '../components/product/ProductCard';
import { ProductCardSkeleton } from '../components/ui/Skeleton';
import { Button } from '../components/ui/Button';
import { FilterPanel, type FilterValues } from '../components/product/FilterPanel';

const SORT_OPTIONS = [
  { value: 'created_at-desc', label: 'Newest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating-desc', label: 'Top Rated' },
  { value: 'review_count-desc', label: 'Most Popular' },
];

export function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(1);

  const filters: FilterValues = useMemo(() => ({
    category: searchParams.get('category') ?? undefined,
    min_price: searchParams.get('min_price') ?? undefined,
    max_price: searchParams.get('max_price') ?? undefined,
    tags: searchParams.get('tags') ?? undefined,
    search: searchParams.get('search') ?? undefined,
  }), [searchParams]);

  const sort = searchParams.get('sort') ?? 'created_at';
  const order = searchParams.get('order') ?? 'desc';
  const sortValue = `${sort}-${order}`;

  const { data, isLoading } = useProducts({
    ...filters,
    sort,
    order,
    page,
    limit: 12,
  });
  const { data: categories } = useCategories();

  const setSort = useCallback((val: string) => {
    const [s, o] = val.split('-');
    setSearchParams(prev => { prev.set('sort', s); prev.set('order', o); return prev; });
    setPage(1);
  }, [setSearchParams]);

  const applyFilters = useCallback((values: FilterValues) => {
    setSearchParams(prev => {
      (Object.keys(values) as (keyof FilterValues)[]).forEach(k => {
        if (values[k]) prev.set(k, values[k]!);
        else prev.delete(k);
      });
      return prev;
    });
    setPage(1);
  }, [setSearchParams]);

  const clearAll = useCallback(() => {
    setSearchParams(prev => {
      ['category', 'min_price', 'max_price', 'tags', 'search'].forEach(k => prev.delete(k));
      return prev;
    });
    setPage(1);
  }, [setSearchParams]);

  const removeFilter = useCallback((key: keyof FilterValues) => {
    setSearchParams(prev => { prev.delete(key); return prev; });
    setPage(1);
  }, [setSearchParams]);

  const products = data?.data ?? [];
  const pagination = data?.pagination;
  const activeFilters = (Object.entries(filters).filter(([, v]) => v) as [keyof FilterValues, string][]);
  const categoryName = filters.category
    ? categories?.find(c => c.slug === filters.category)?.name
    : null;

  return (
    <>
      <Helmet>
        <title>{categoryName ?? 'Shop All Products'} — SWIPO</title>
      </Helmet>
      <div className="pt-20 min-h-screen bg-white">
        {/* Page Header */}
        <div className="bg-brand-card py-10 lg:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl lg:text-4xl font-black text-brand-heading">
              {categoryName ?? 'All Products'}
            </h1>
            <p className="text-gray-500 mt-2 text-sm">
              {pagination?.total ?? 0} {pagination?.total === 1 ? 'product' : 'products'} found
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-8">
            {/* Sidebar (desktop) */}
            <div className="hidden lg:block">
              <div className="sticky top-24">
                <FilterPanel
                  open={true}
                  onClose={() => {}}
                  values={filters}
                  onChange={applyFilters}
                  onClear={clearAll}
                  totalResults={pagination?.total}
                />
              </div>
            </div>

            {/* Main content */}
            <div className="min-w-0">
              {/* Toolbar */}
              <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
                <button
                  onClick={() => setFilterOpen(true)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2.5 border-2 border-gray-200 rounded-full text-sm font-bold hover:border-brand-accent transition-colors"
                >
                  <SlidersHorizontal size={14} /> Filters
                  {activeFilters.length > 0 && (
                    <span className="bg-brand-accent text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                      {activeFilters.length}
                    </span>
                  )}
                </button>

                <div className="relative ml-auto">
                  <select
                    value={sortValue}
                    onChange={e => setSort(e.target.value)}
                    className="appearance-none pl-4 pr-10 py-2.5 border-2 border-gray-200 rounded-full text-sm font-bold bg-white focus:outline-none focus:border-brand-accent cursor-pointer"
                  >
                    {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
                </div>
              </div>

              {/* Active filters chips */}
              <AnimatePresence>
                {activeFilters.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex flex-wrap gap-2 mb-6 overflow-hidden"
                  >
                    {activeFilters.map(([key, value]) => (
                      <motion.button
                        key={key}
                        layout
                        onClick={() => removeFilter(key)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-accent/10 text-brand-accent text-xs font-bold rounded-full hover:bg-brand-accent hover:text-white transition-colors"
                      >
                        <span className="capitalize">{key.replace('_', ' ')}:</span>
                        <span>
                          {key === 'category'
                            ? categories?.find(c => c.slug === value)?.name ?? value
                            : key === 'min_price' ? `$${value}+`
                            : key === 'max_price' ? `Up to $${value}`
                            : value}
                        </span>
                        <X size={12} />
                      </motion.button>
                    ))}
                    <button
                      onClick={clearAll}
                      className="text-xs font-bold text-red-500 hover:underline px-2"
                    >
                      Clear all
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4 lg:gap-6">
                {isLoading
                  ? Array.from({ length: 12 }).map((_, i) => <ProductCardSkeleton key={i} />)
                  : products.length === 0
                    ? (
                      <div className="col-span-full bg-brand-card rounded-3xl text-center py-16 px-6">
                        <Package size={36} className="mx-auto text-gray-300 mb-3" />
                        <p className="text-lg font-bold text-brand-heading">No products found</p>
                        <p className="text-sm text-gray-400 mt-1">Try adjusting your filters or search</p>
                        {activeFilters.length > 0 && (
                          <Button variant="outline" size="sm" className="mt-4" onClick={clearAll}>
                            Clear filters
                          </Button>
                        )}
                      </div>
                    )
                    : products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)
                }
              </div>

              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-12 flex-wrap">
                  <Button
                    variant="outline" size="sm"
                    disabled={page === 1}
                    onClick={() => { setPage(p => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  >
                    Previous
                  </Button>
                  <div className="flex gap-1">
                    {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                      .filter(p => p === 1 || p === pagination.pages || Math.abs(p - page) <= 1)
                      .map((p, idx, arr) => (
                        <span key={p} className="flex items-center">
                          {idx > 0 && arr[idx - 1] !== p - 1 && <span className="px-2 text-gray-300">…</span>}
                          <button
                            onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                            className={`w-9 h-9 rounded-full text-sm font-bold transition-all ${
                              p === page ? 'bg-brand-dark text-white' : 'hover:bg-gray-100 text-gray-600'
                            }`}
                          >
                            {p}
                          </button>
                        </span>
                      ))}
                  </div>
                  <Button
                    variant="outline" size="sm"
                    disabled={page === pagination.pages}
                    onClick={() => { setPage(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile filter drawer */}
        <FilterPanel
          open={filterOpen}
          onClose={() => setFilterOpen(false)}
          values={filters}
          onChange={applyFilters}
          onClear={clearAll}
          totalResults={pagination?.total}
        />
      </div>
    </>
  );
}
