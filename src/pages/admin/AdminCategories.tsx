import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, X, Save, FolderTree, Image as ImageIcon } from 'lucide-react';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '../../hooks/useProducts';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { ImageUploader } from '../../components/admin/ImageUploader';
import toast from 'react-hot-toast';
import type { Category } from '../../types';

export function AdminCategories() {
  const { data: categories, isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: '', image_url: '' });

  const openNew = () => { setEditing(null); setForm({ name: '', image_url: '' }); setModalOpen(true); };
  const openEdit = (cat: Category) => {
    setEditing(cat);
    setForm({ name: cat.name, image_url: cat.image_url ?? '' });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name.trim(),
      image_url: form.image_url.trim() || null,
    };
    if (!payload.name) return;
    try {
      if (editing) {
        await updateCategory.mutateAsync({ id: editing.id, data: payload });
        toast.success('Category updated');
      } else {
        await createCategory.mutateAsync(payload as any);
        toast.success('Category created');
      }
      setModalOpen(false);
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to save');
    }
  };

  const handleDelete = async (cat: Category) => {
    if (!confirm(`Delete "${cat.name}"? This cannot be undone.`)) return;
    try {
      await deleteCategory.mutateAsync(cat.id);
      toast.success('Category deleted');
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to delete');
    }
  };

  return (
    <>
      <Helmet><title>Categories — SWIPO Admin</title></Helmet>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-black text-brand-heading">Categories</h1>
            <p className="text-gray-400 text-sm mt-0.5">{categories?.length ?? 0} categories — appear automatically on the storefront</p>
          </div>
          <Button variant="primary" onClick={openNew}>
            <Plus size={16} /> Add Category
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
          </div>
        ) : categories?.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center">
            <FolderTree size={36} className="mx-auto text-gray-300 mb-3" />
            <p className="font-semibold text-gray-500 mb-1">No categories yet</p>
            <p className="text-sm text-gray-400 mb-5">Create your first category to start organizing products</p>
            <Button variant="primary" onClick={openNew}>
              <Plus size={16} /> Create Category
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories?.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bg-white rounded-2xl overflow-hidden hover:shadow-md transition-shadow group"
              >
                <div className="aspect-[5/3] bg-brand-card overflow-hidden relative">
                  {cat.image_url ? (
                    <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <ImageIcon size={32} />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-bold text-brand-heading truncate">{cat.name}</p>
                      <p className="text-xs text-gray-400 font-mono mt-0.5">/{cat.slug}</p>
                    </div>
                    <span className="px-2.5 py-1 bg-brand-accent/10 text-brand-accent text-xs font-bold rounded-full whitespace-nowrap">
                      {cat.product_count ?? 0} {cat.product_count === 1 ? 'item' : 'items'}
                    </span>
                  </div>
                  <div className="flex gap-1 mt-3 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => openEdit(cat)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-brand-text hover:text-brand-accent hover:bg-gray-50 rounded-lg transition-all"
                    >
                      <Pencil size={12} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(cat)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

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
              <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                  <h2 className="text-xl font-black text-brand-heading">
                    {editing ? 'Edit Category' : 'New Category'}
                  </h2>
                  <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Name *</label>
                    <input
                      required value={form.name}
                      onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-brand-accent text-sm"
                      placeholder="e.g. Bedroom Furniture"
                    />
                    <p className="text-xs text-gray-400 mt-1.5">
                      URL slug will be: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px]">/{form.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'category-name'}</code>
                    </p>
                  </div>

                  <ImageUploader
                    label="Category Image"
                    maxImages={1}
                    value={form.image_url ? [form.image_url] : []}
                    onChange={imgs => setForm(p => ({ ...p, image_url: imgs[0] ?? '' }))}
                  />

                  <div className="flex gap-3 pt-2">
                    <Button type="button" variant="outline" onClick={() => setModalOpen(false)} className="flex-1">Cancel</Button>
                    <Button type="submit" variant="primary" loading={createCategory.isPending || updateCategory.isPending} className="flex-1">
                      <Save size={14} /> {editing ? 'Save' : 'Create'}
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
