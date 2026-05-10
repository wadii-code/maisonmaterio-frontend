import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, ImagePlus, Loader2, GripVertical } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface ImageUploaderProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
  label?: string;
}

const BUCKET = 'product-images';
const MAX_SIZE_MB = 5;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export function ImageUploader({ value, onChange, maxImages = 8, label = 'Images du produit' }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const remainingSlots = maxImages - value.length;

  const uploadFiles = async (files: FileList | File[]) => {
    const fileArr = Array.from(files).slice(0, remainingSlots);
    if (fileArr.length === 0) return;

    // Validate
    for (const file of fileArr) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        toast.error(`${file.name} : type non pris en charge. Utilisez JPG, PNG, WebP ou GIF.`);
        return;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        toast.error(`${file.name} : dépasse la limite de ${MAX_SIZE_MB} Mo.`);
        return;
      }
    }

    setUploading(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of fileArr) {
        const ext = file.name.split('.').pop() ?? 'jpg';
        const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

        const { error: uploadErr } = await supabase.storage
          .from(BUCKET)
          .upload(path, file, { cacheControl: '3600', upsert: false });

        if (uploadErr) {
          toast.error(`Échec du téléversement : ${uploadErr.message}`);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path);
        uploadedUrls.push(publicUrl);
      }

      if (uploadedUrls.length > 0) {
        onChange([...value, ...uploadedUrls]);
        toast.success(`${uploadedUrls.length} image${uploadedUrls.length > 1 ? 's' : ''} téléversée${uploadedUrls.length > 1 ? 's' : ''}`);
      }
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) uploadFiles(e.dataTransfer.files);
  };

  const removeImage = async (index: number) => {
    const url = value[index];
    onChange(value.filter((_, i) => i !== index));

    // Best-effort cleanup of the underlying file in storage
    try {
      const path = url.split(`/${BUCKET}/`)[1];
      if (path) await supabase.storage.from(BUCKET).remove([path]);
    } catch { /* ignore — orphaned files can be cleaned manually */ }
  };

  const moveImage = (from: number, to: number) => {
    if (to < 0 || to >= value.length) return;
    const next = [...value];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
          {label}
        </label>
        <span className="text-xs text-gray-400">
          {value.length} / {maxImages}
        </span>
      </div>

      {/* Existing images */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          <AnimatePresence>
            {value.map((url, i) => (
              <motion.div
                key={url}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group"
              >
                <img src={url} alt="" className="w-full h-full object-cover" />
                {i === 0 && (
                  <span className="absolute top-1.5 left-1.5 bg-brand-accent text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                    PRINCIPALE
                  </span>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                  {i > 0 && (
                    <button
                      type="button"
                      onClick={() => moveImage(i, i - 1)}
                      className="p-1.5 bg-white/90 hover:bg-white rounded-lg text-gray-700 text-xs font-bold"
                      title="Déplacer à gauche (la première image devient principale)"
                    >
                      ←
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="p-1.5 bg-red-500 hover:bg-red-600 rounded-lg text-white"
                    title="Supprimer"
                  >
                    <X size={14} />
                  </button>
                  {i < value.length - 1 && (
                    <button
                      type="button"
                      onClick={() => moveImage(i, i + 1)}
                      className="p-1.5 bg-white/90 hover:bg-white rounded-lg text-gray-700 text-xs font-bold"
                      title="Déplacer à droite"
                    >
                      →
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Drop zone */}
      {value.length < maxImages && (
        <label
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center gap-2 py-8 px-4 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
            dragOver
              ? 'border-brand-accent bg-brand-accent/5'
              : 'border-gray-200 hover:border-brand-accent hover:bg-gray-50'
          } ${uploading ? 'pointer-events-none opacity-60' : ''}`}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={ACCEPTED_TYPES.join(',')}
            className="hidden"
            onChange={e => e.target.files && uploadFiles(e.target.files)}
            disabled={uploading}
          />
          {uploading ? (
            <>
              <Loader2 size={24} className="text-brand-accent animate-spin" />
              <p className="text-sm font-semibold text-gray-500">Téléversement…</p>
            </>
          ) : (
            <>
              <div className="p-3 bg-brand-accent/10 rounded-full">
                {value.length === 0 ? (
                  <ImagePlus size={20} className="text-brand-accent" />
                ) : (
                  <Upload size={20} className="text-brand-accent" />
                )}
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-brand-heading">
                  {value.length === 0 ? 'Ajouter des images' : 'Ajouter plus d\'images'}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Glissez-déposez ou cliquez pour parcourir · JPG, PNG, WebP jusqu'à {MAX_SIZE_MB} Mo
                </p>
              </div>
            </>
          )}
        </label>
      )}
    </div>
  );
}
