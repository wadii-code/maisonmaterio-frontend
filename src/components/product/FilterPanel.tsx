import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCcw } from 'lucide-react';
import { useCategories } from '../../hooks/useProducts';
import { Button } from '../ui/Button';

export interface FilterValues {
  category?: string;
  // Room filtering (URL param: ?room=<room-slug>)
  room?: string;
  min_price?: string;
  max_price?: string;
  tags?: string;
  search?: string;
}


interface FilterPanelProps {
  open: boolean;
  onClose: () => void;
  values: FilterValues;
  onChange: (values: FilterValues) => void;
  onClear: () => void;
  totalResults?: number;
}

const TAG_OPTIONS = ['HOT', 'NEW', 'SALE'];

export function FilterPanel({ open, onClose, values, onChange, onClear, totalResults }: FilterPanelProps) {
  const { data: categories } = useCategories();
  const [local, setLocal] = useState<FilterValues>(values);


  useEffect(() => { setLocal(values); }, [values]);

  const updateLocal = (patch: Partial<FilterValues>) => setLocal(prev => ({ ...prev, ...patch }));

  const apply = () => {
    onChange(local);
    onClose();
  };

  const toggleTag = (tag: string) => {
    const current = (local.tags ?? '').split(',').filter(Boolean);
    const next = current.includes(tag) ? current.filter(t => t !== tag) : [...current, tag];
    updateLocal({ tags: next.length ? next.join(',') : undefined });
  };

  const activeCount = Object.values(local).filter(v => v && v !== '').length;

  return (
    <>
      {/* Mobile drawer + Desktop sidebar */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 32 }}
              className="fixed lg:static inset-y-0 left-0 w-full sm:w-80 lg:w-full bg-white z-50 lg:z-auto flex flex-col lg:rounded-2xl lg:shadow-sm overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <div>
                  <h3 className="font-black text-brand-heading">Filtres</h3>
                  {activeCount > 0 && (
                    <p className="text-xs text-brand-accent font-bold mt-0.5">{activeCount} actif{activeCount > 1 ? 's' : ''}</p>
                  )}
                </div>
                <button onClick={onClose} className="lg:hidden p-1.5 hover:bg-gray-100 rounded-full">
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                {/* Categories */}
                <FilterSection title="Catégorie">
                  <div className="space-y-1">
                    <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 px-2 py-1.5 rounded-lg">
                      <input
                        type="radio" name="cat"
                        checked={!local.category}
                        onChange={() => updateLocal({ category: undefined })}
                        className="accent-brand-accent"
                      />
                      <span className="text-sm text-brand-text">Toutes les catégories</span>
                    </label>
                    {categories?.map(cat => (
                      <label key={cat.id} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 px-2 py-1.5 rounded-lg">
                        <input
                          type="radio" name="cat"
                          checked={local.category === cat.slug}
                          onChange={() => updateLocal({ category: cat.slug })}
                          className="accent-brand-accent"
                        />
                        <span className="text-sm text-brand-text flex-1">{cat.name}</span>
                        <span className="text-xs text-gray-400">{cat.product_count ?? 0}</span>
                      </label>
                    ))}
                  </div>
                </FilterSection>

                {/* Price Range */}
                <FilterSection title="Fourchette de prix">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Min</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">MAD</span>
                        <input
                          type="number" min="0" placeholder="0"
                          value={local.min_price ?? ''}
                          onChange={e => updateLocal({ min_price: e.target.value || undefined })}
                          className="w-full pl-12 pr-3 py-2.5 border-2 border-gray-100 rounded-xl text-sm focus:outline-none focus:border-brand-accent"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Max</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">MAD</span>
                        <input
                          type="number" min="0" placeholder="Aucun"
                          value={local.max_price ?? ''}
                          onChange={e => updateLocal({ max_price: e.target.value || undefined })}
                          className="w-full pl-12 pr-3 py-2.5 border-2 border-gray-100 rounded-xl text-sm focus:outline-none focus:border-brand-accent"
                        />
                      </div>
                    </div>
                  </div>
                  {/* Quick price chips */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {[
                      { label: '< 500 MAD', min: '', max: '500' },
                      { label: '500–2k', min: '500', max: '2000' },
                      { label: '2k–5k', min: '2000', max: '5000' },
                      { label: '5k+', min: '5000', max: '' },
                    ].map(p => (
                      <button key={p.label}
                        onClick={() => updateLocal({ min_price: p.min || undefined, max_price: p.max || undefined })}
                        className="px-2.5 py-1 text-[11px] font-bold bg-gray-100 hover:bg-brand-accent hover:text-white text-gray-600 rounded-full transition-colors"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </FilterSection>

                {/* Tags */}
                <FilterSection title="Spécial">
                  <div className="flex flex-wrap gap-2">
                    {TAG_OPTIONS.map(tag => {
                      const isActive = (local.tags ?? '').split(',').includes(tag);
                      return (
                        <button key={tag} onClick={() => toggleTag(tag)}
                          className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all ${
                            isActive
                              ? 'bg-brand-accent text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </FilterSection>
              </div>

              {/* Footer actions */}
              <div className="p-4 border-t border-gray-100 space-y-2 bg-white">
                <Button variant="primary" fullWidth onClick={apply}>
                  {totalResults !== undefined ? `Voir ${totalResults} résultat${totalResults > 1 ? 's' : ''}` : 'Appliquer les filtres'}
                </Button>
                <button
                  onClick={() => { onClear(); onClose(); }}
                  className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-gray-500 hover:text-red-500 py-2 transition-colors"
                >
                  <RotateCcw size={12} /> Effacer tous les filtres
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-xs font-black text-brand-heading uppercase tracking-wider mb-3">{title}</h4>
      {children}
    </div>
  );
}
