import { useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SlidersHorizontal, ChevronDown, X } from 'lucide-react';
import { useProducts, useCategories } from '../hooks/useProducts';
import { ProductCard } from '../components/product/ProductCard';
import { ProductCardSkeleton } from '../components/ui/Skeleton';
import { Button } from '../components/ui/Button';

const SORT_OPTIONS = [
  { value: 'created_at-desc', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating-desc', label: 'Top Rated' },
];

export function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);

  const category = searchParams.get('category') ?? undefined;
  const room = searchParams.get('room') ?? undefined;
  const sort = searchParams.get('sort') ?? 'created_at';
  const order = searchParams.get('order') ?? 'desc';
  const minPrice = searchParams.get('min_price') ?? undefined;
  const maxPrice = searchParams.get('max_price') ?? undefined;
  const search = searchParams.get('search') ?? undefined;

  const { data, isLoading } = useProducts({ category, room, sort, order, min_price: minPrice, max_price: maxPrice, search, page, limit: 12 });
  const { data: categories } = useCategories();

  const setSort = useCallback((val: string) => {
    const [s, o] = val.split('-');
    setSearchParams(prev => { prev.set('sort', s); prev.set('order', o); return prev; });
    setPage(1);
  }, [setSearchParams]);

  const setCategory = useCallback((slug: string | undefined) => {
    setSearchParams(prev => { slug ? prev.set('category', slug) : prev.delete('category'); return prev; });
    setPage(1);
  }, [setSearchParams]);

  const products = data?.data ?? [];
  const pagination = data?.pagination;
  const sortValue = `${sort}-${order}`;

  return (
    <>
      <Helmet>
        <title>Shop All Products — SWIPO</title>
      </Helmet>
      <div className="pt-20 min-h-screen bg-white">
        {/* Page Header */}
        <div className="bg-brand-card py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-black text-brand-heading">
              {category ? categories?.find(c => c.slug === category)?.name ?? 'Products' : 'All Products'}
            </h1>
            <p className="text-gray-500 mt-2">
              {pagination?.total ?? 0} products found
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-full text-sm font-semibold hover:border-brand-accent transition-colors lg:hidden"
            >
              <SlidersHorizontal size={16} /> Filters
            </button>

            {/* Category pills */}
            <div className="hidden lg:flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setCategory(undefined)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${!category ? 'bg-brand-dark text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                All
              </button>
              {categories?.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.slug === category ? undefined : cat.slug)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${cat.slug === category ? 'bg-brand-dark text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 ml-auto">
              {(category || minPrice || maxPrice) && (
                <button onClick={() => { setSearchParams({}); setPage(1); }}
                  className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600"
                >
                  <X size={14} /> Clear filters
                </button>
              )}
              <div className="relative">
                <select
                  value={sortValue}
                  onChange={e => setSort(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-2.5 border border-gray-200 rounded-full text-sm font-semibold bg-white focus:outline-none focus:border-brand-accent cursor-pointer"
                >
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
              </div>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {isLoading
              ? Array.from({ length: 12 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : products.length === 0
                ? (
                  <div className="col-span-full text-center py-20 text-gray-400">
                    <p className="text-xl font-semibold">No products found</p>
                    <p className="text-sm mt-2">Try adjusting your filters</p>
                  </div>
                )
                : products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)
            }
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-12">
              <Button
                variant="outline" size="sm"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                Previous
              </Button>
              <div className="flex gap-1">
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-full text-sm font-semibold transition-all ${
                      p === page ? 'bg-brand-dark text-white' : 'hover:bg-gray-100 text-gray-600'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <Button
                variant="outline" size="sm"
                disabled={page === pagination.pages}
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
