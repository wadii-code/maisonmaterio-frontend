import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, Search, ToggleLeft, ToggleRight, X, Save, Upload } from 'lucide-react';
import { useProducts, useCategories, useRooms, useCreateProduct, useUpdateProduct, useDeleteProduct } from '../../hooks/useProducts';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { ImageUploader } from '../../components/admin/ImageUploader';
import { ColorEditor } from '../../components/admin/ColorEditor';
import { formatPrice, cleanProductName } from '../../lib/format';
import type { ProductColor } from '../../types';
import toast from 'react-hot-toast';
import type { Product } from '../../types';

interface ProductFormData {
  name: string; description: string; price: string; discount_price: string;
  category_id: string; room_id: string; stock: string; status: 'active' | 'inactive';
  material: string; dimensions: string; tags: string; images: string[]; colors: ProductColor[];
  seo_description: string;
  meta_title: string;
  meta_description: string;
}

const EMPTY_FORM: ProductFormData = {
  name: '', description: '', price: '', discount_price: '',
  category_id: '', room_id: '', stock: '0', status: 'active',
  material: '', dimensions: '', tags: '', images: [], colors: [],
  seo_description: '', meta_title: '', meta_description: '',
};

export function AdminProducts() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductFormData>(EMPTY_FORM);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const { user, profile, isSuperAdmin } = useAuthStore();
  const isSuper = isSuperAdmin();
  // Sub-admins see only the products they created (the backend filters when ?mine=1 is set).
  // Super-admins see everything in the catalogue.
  const { data, isLoading } = useProducts({
    search: search || undefined,
    page,
    limit: 15,
    status: undefined,
    mine: isSuper ? undefined : '1',
  });
  const { data: categories } = useCategories();
  const { data: rooms } = useRooms();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const products = data?.data ?? [];

  const openNew = () => { setEditProduct(null); setForm(EMPTY_FORM); setModalOpen(true); };
  const openEdit = (p: Product) => {
    setEditProduct(p);
    setForm({
      name: p.name, description: p.description, price: String(p.price),
      discount_price: p.discount_price ? String(p.discount_price) : '',
      category_id: p.category_id, room_id: p.room_id ?? '',
      stock: String(p.stock), status: p.status,
      material: p.material ?? '', dimensions: p.dimensions ?? '',
      tags: p.tags.join(', '), images: p.images ?? [],
      colors: p.colors ?? [],
      seo_description: p.seo_description ?? '',
      meta_title: p.meta_title ?? '',
      meta_description: p.meta_description ?? '',
    });
    setModalOpen(true);
  };

  const setField = <K extends keyof ProductFormData>(k: K, v: ProductFormData[K]) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name, description: form.description,
      price: parseFloat(form.price),
      discount_price: form.discount_price ? parseFloat(form.discount_price) : null,
      category_id: form.category_id,
      room_id: form.room_id || null,
      stock: parseInt(form.stock),
      status: form.status,
      material: form.material || null,
      dimensions: form.dimensions || null,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      images: form.images,
      colors: form.colors,
      seo_description: form.seo_description.trim() || null,
      meta_title: form.meta_title.trim() || null,
      meta_description: form.meta_description.trim() || null,
    };
    try {
      if (editProduct) {
        await updateProduct.mutateAsync({ id: editProduct.id, data: payload });
        toast.success('Produit mis à jour');
      } else {
        await createProduct.mutateAsync(payload as any);
        toast.success('Produit créé');
      }
      setModalOpen(false);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce produit ?')) return;
    try {
      await deleteProduct.mutateAsync(id);
      toast.success('Produit supprimé');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedIds(next);
  };

  return (
    <>
      <Helmet><title>Produits — Maison Materiau Admin</title></Helmet>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-black text-brand-heading">Produits</h1>
            <p className="text-gray-400 text-sm mt-0.5">{data?.pagination?.total ?? 0} produits au total</p>
          </div>
          <Button variant="primary" onClick={openNew}>
            <Plus size={16} /> Ajouter un produit
          </Button>
        </div>

        {/* Search / Filters */}
        <div className="bg-white rounded-2xl p-4 flex gap-4 items-center">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text" placeholder="Rechercher des produits…"
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-accent"
            />
          </div>
          {isSuper && selectedIds.size > 0 && (
            <div className="flex gap-2">
              <span className="text-sm font-semibold text-gray-500">{selectedIds.size} sélectionné(s)</span>
              <Button variant="danger" size="sm" onClick={() => { if (confirm(`Supprimer ${selectedIds.size} produits ?`)) { selectedIds.forEach(id => deleteProduct.mutate(id)); setSelectedIds(new Set()); }}}>
                Supprimer la sélection
              </Button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {isSuper && (
                    <th className="w-10 px-4 py-3">
                      <input type="checkbox" onChange={e => setSelectedIds(e.target.checked ? new Set(products.map(p => p.id)) : new Set())}
                        checked={selectedIds.size === products.length && products.length > 0} className="rounded" />
                    </th>
                  )}
                  {['Produit', 'Catégorie', 'Prix', 'Stock', 'Statut', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}><td colSpan={isSuper ? 7 : 6} className="px-4 py-3"><Skeleton className="h-10" /></td></tr>
                  ))
                ) : products.map(product => (
                  <tr key={product.id} className={`hover:bg-gray-50 transition-colors ${selectedIds.has(product.id) ? 'bg-brand-accent/5' : ''}`}>
                    {isSuper && (
                      <td className="px-4 py-3">
                        <input type="checkbox" checked={selectedIds.has(product.id)} onChange={() => toggleSelect(product.id)} className="rounded" />
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                          <img
                            src={product.images?.[0] ?? `https://placehold.co/40x40/f5f5f5/999?text=P`}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-brand-heading line-clamp-1">{cleanProductName(product.name)}</p>
                          <p className="text-xs text-gray-400 font-mono">{product.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {(product as any).categories?.name ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {product.discount_price ? (
                          <>
                            <span className="font-bold text-brand-accent">{formatPrice(product.discount_price)}</span>
                            <span className="text-xs text-gray-300 line-through">{formatPrice(product.price)}</span>
                          </>
                        ) : (
                          <span className="font-bold">{formatPrice(product.price)}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-semibold ${product.stock <= 5 ? 'text-red-500' : product.stock <= 20 ? 'text-yellow-500' : 'text-emerald-600'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        label={product.status === 'active' ? 'actif' : 'inactif'}
                        color={product.status === 'active' ? 'green' : 'gray'}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {(() => {
                          const owns = isSuper || product.created_by === user?.id;
                          return (
                            <>
                              <button
                                onClick={() => owns && openEdit(product)}
                                disabled={!owns}
                                title={owns ? 'Modifier' : 'Vous ne pouvez modifier que vos propres produits'}
                                className="p-2 text-gray-400 hover:text-brand-accent hover:bg-gray-100 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-400"
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                onClick={() => owns && handleDelete(product.id)}
                                disabled={!owns}
                                title={owns ? 'Supprimer' : 'Vous ne pouvez supprimer que vos propres produits'}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-400"
                              >
                                <Trash2 size={14} />
                              </button>
                            </>
                          );
                        })()}
                      </div>
                    </td>
                  </tr>
                ))}
                {!isLoading && products.length === 0 && (
                  <tr><td colSpan={isSuper ? 7 : 6} className="px-4 py-12 text-center text-gray-400">Aucun produit trouvé</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data?.pagination && data.pagination.pages > 1 && (
            <div className="flex justify-center gap-2 px-6 py-4 border-t border-gray-100">
              {Array.from({ length: data.pagination.pages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-full text-sm font-semibold transition-all ${p === page ? 'bg-brand-dark text-white' : 'hover:bg-gray-100'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Product Modal */}
      <AnimatePresence>
        {modalOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
              onClick={() => setModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={e => e.stopPropagation()}
            >
              <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white rounded-t-3xl z-10">
                  <h2 className="text-xl font-black text-brand-heading">
                    {editProduct ? 'Modifier le produit' : 'Nouveau produit'}
                  </h2>
                  <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="col-span-full">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Nom du produit *</label>
                      <input required value={form.name} onChange={e => setField('name', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-brand-accent text-sm"
                        placeholder="ex. Chaise lounge moderne" />
                    </div>

                    <div className="col-span-full">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Description *</label>
                      <textarea required rows={3} value={form.description} onChange={e => setField('description', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-brand-accent text-sm resize-none"
                        placeholder="Description du produit…" />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Prix *</label>
                      <input required type="number" min="0" step="0.01" value={form.price} onChange={e => setField('price', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-brand-accent text-sm"
                        placeholder="0.00" />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Prix promotionnel</label>
                      <input type="number" min="0" step="0.01" value={form.discount_price} onChange={e => setField('discount_price', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-brand-accent text-sm"
                        placeholder="0.00 (facultatif)" />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Catégorie *</label>
                      <select required value={form.category_id} onChange={e => setField('category_id', e.target.value)}
                        className="w-full px-4 py-3 pr-10 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-brand-accent text-sm bg-white appearance-none bg-[url('data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%239ca3af%22%20stroke-width%3D%222.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_1rem_center] bg-[length:12px_12px] hover:border-gray-200 transition-colors cursor-pointer"
                      >
                        <option value="">Choisir une catégorie</option>
                        {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Pièce de la maison</label>
                      <select value={form.room_id} onChange={e => setField('room_id', e.target.value)}
                        className="w-full px-4 py-3 pr-10 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-brand-accent text-sm bg-white appearance-none bg-[url('data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%239ca3af%22%20stroke-width%3D%222.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_1rem_center] bg-[length:12px_12px] hover:border-gray-200 transition-colors cursor-pointer"
                      >
                        <option value="">— Aucune —</option>
                        {rooms?.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Stock *</label>
                      <input required type="number" min="0" value={form.stock} onChange={e => setField('stock', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-brand-accent text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Matériau</label>
                      <input value={form.material} onChange={e => setField('material', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-brand-accent text-sm"
                        placeholder="ex. Chêne, Acier, Tissu" />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Dimensions</label>
                      <input value={form.dimensions} onChange={e => setField('dimensions', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-brand-accent text-sm"
                        placeholder="ex. 80 x 60 x 45 cm" />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Étiquettes (séparées par virgules)</label>
                      <input value={form.tags} onChange={e => setField('tags', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-brand-accent text-sm"
                        placeholder="HOT, NEW, SALE" />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Statut</label>
                      <select value={form.status} onChange={e => setField('status', e.target.value as 'active' | 'inactive')}
                        className="w-full px-4 py-3 pr-10 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-brand-accent text-sm bg-white appearance-none bg-[url('data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%239ca3af%22%20stroke-width%3D%222.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_1rem_center] bg-[length:12px_12px] hover:border-gray-200 transition-colors cursor-pointer"
                      >
                        <option value="active">Actif</option>
                        <option value="inactive">Inactif</option>
                      </select>
                    </div>

                    <div className="col-span-full">
                      <ImageUploader
                        value={form.images}
                        onChange={imgs => setForm(p => ({ ...p, images: imgs }))}
                      />
                    </div>

                    <div className="col-span-full">
                      <ColorEditor
                        value={form.colors}
                        onChange={cs => setForm(p => ({ ...p, colors: cs }))}
                      />
                    </div>

                    {/* SEO section */}
                    <div className="col-span-full mt-2 pt-5 border-t border-gray-100">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-black text-brand-heading">SEO &amp; référencement</h3>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                          Indexable par Google
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mb-4">
                        Ces champs ne sont pas affichés visuellement aux clients mais sont présents dans le HTML pour les moteurs de recherche.
                      </p>
                    </div>

                    <div className="col-span-full">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                        Description SEO (longue, riche en mots-clés)
                      </label>
                      <textarea
                        rows={6}
                        maxLength={10000}
                        value={form.seo_description}
                        onChange={e => setField('seo_description', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-brand-accent text-sm resize-y"
                        placeholder="Description longue avec mots-clés pour le référencement Google. Décrivez les matériaux, les usages, les pièces de la maison, les avantages, les marques associées, les termes de recherche fréquents…"
                      />
                      <div className="flex items-center justify-between mt-1.5">
                        <p className="text-[11px] text-gray-400">
                          Idéalement 300–1500 caractères. Inclut des termes de recherche que les clients utilisent.
                        </p>
                        <span className={`text-[11px] font-mono ${form.seo_description.length > 9500 ? 'text-red-500' : 'text-gray-400'}`}>
                          {form.seo_description.length} / 10000
                        </span>
                      </div>
                    </div>

                    <div className="col-span-full">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                        Meta title (balise &lt;title&gt;)
                      </label>
                      <input
                        type="text"
                        maxLength={200}
                        value={form.meta_title}
                        onChange={e => setField('meta_title', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-brand-accent text-sm"
                        placeholder="ex. Chaise lounge moderne en chêne — Maison Materiau Maroc"
                      />
                      <div className="flex items-center justify-between mt-1.5">
                        <p className="text-[11px] text-gray-400">
                          Recommandé : 50–60 caractères. Vide = utilise le nom du produit.
                        </p>
                        <span className={`text-[11px] font-mono ${form.meta_title.length > 60 ? 'text-amber-500' : 'text-gray-400'}`}>
                          {form.meta_title.length} / 60
                        </span>
                      </div>
                    </div>

                    <div className="col-span-full">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                        Meta description (extrait Google)
                      </label>
                      <textarea
                        rows={3}
                        maxLength={500}
                        value={form.meta_description}
                        onChange={e => setField('meta_description', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-brand-accent text-sm resize-y"
                        placeholder="Résumé qui apparaîtra sous le titre dans les résultats de recherche Google."
                      />
                      <div className="flex items-center justify-between mt-1.5">
                        <p className="text-[11px] text-gray-400">
                          Recommandé : 120–160 caractères. Vide = utilise la description du produit.
                        </p>
                        <span className={`text-[11px] font-mono ${form.meta_description.length > 160 ? 'text-amber-500' : 'text-gray-400'}`}>
                          {form.meta_description.length} / 160
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button type="button" variant="outline" onClick={() => setModalOpen(false)} className="flex-1">Annuler</Button>
                    <Button type="submit" variant="primary" loading={createProduct.isPending || updateProduct.isPending} className="flex-1">
                      <Save size={16} /> {editProduct ? 'Enregistrer' : 'Créer le produit'}
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
