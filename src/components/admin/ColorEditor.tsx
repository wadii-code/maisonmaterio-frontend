import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Palette } from 'lucide-react';
import type { ProductColor } from '../../types';

interface ColorEditorProps {
  value: ProductColor[];
  onChange: (colors: ProductColor[]) => void;
}

const PRESETS: { name: string; hex: string }[] = [
  { name: 'Natural Oak', hex: '#c8a97e' },
  { name: 'Walnut',      hex: '#5d4037' },
  { name: 'Matte Black', hex: '#1a1a1a' },
  { name: 'Pure White',  hex: '#f5f5f5' },
  { name: 'Beige',       hex: '#d7c4a8' },
  { name: 'Olive',       hex: '#708238' },
  { name: 'Navy',        hex: '#1f3a93' },
  { name: 'Burgundy',    hex: '#7a1e1e' },
];

export function ColorEditor({ value, onChange }: ColorEditorProps) {
  const update = (i: number, patch: Partial<ProductColor>) => {
    onChange(value.map((c, idx) => idx === i ? { ...c, ...patch } : c));
  };
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));
  const add = (preset?: { name: string; hex: string }) => {
    onChange([
      ...value,
      preset
        ? { name: preset.name, hex: preset.hex, price_delta: 0 }
        : { name: 'New Color', hex: '#000000', price_delta: 0 },
    ]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
          Color Variants
        </label>
        <span className="text-xs text-gray-400">{value.length} added</span>
      </div>

      {value.length === 0 ? (
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
          <Palette size={20} className="mx-auto text-gray-300 mb-2" />
          <p className="text-sm font-semibold text-gray-500 mb-1">No color variants</p>
          <p className="text-xs text-gray-400">Add colors so customers can pick — each can have its own price.</p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {value.map((color, i) => (
              <motion.div
                key={i}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-2 p-2 bg-gray-50 rounded-xl"
              >
                {/* Color picker */}
                <label className="relative shrink-0 cursor-pointer">
                  <input
                    type="color"
                    value={color.hex}
                    onChange={e => update(i, { hex: e.target.value })}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div
                    className="w-10 h-10 rounded-lg border-2 border-white shadow-sm"
                    style={{ backgroundColor: color.hex }}
                  />
                </label>

                {/* Hex input */}
                <input
                  value={color.hex}
                  onChange={e => update(i, { hex: e.target.value })}
                  placeholder="#000000"
                  className="w-24 px-2 py-2 bg-white border border-gray-200 rounded-lg text-xs font-mono focus:outline-none focus:border-brand-accent"
                />

                {/* Name */}
                <input
                  value={color.name}
                  onChange={e => update(i, { name: e.target.value })}
                  placeholder="Color name"
                  className="flex-1 min-w-0 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-accent"
                />

                {/* Price delta */}
                <div className="relative shrink-0">
                  <input
                    type="number"
                    step="0.01"
                    value={color.price_delta}
                    onChange={e => update(i, { price_delta: parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                    className="w-24 pl-2 pr-12 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-accent"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 pointer-events-none">MAD</span>
                </div>

                <button
                  type="button"
                  onClick={() => remove(i)}
                  aria-label="Remove color"
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                >
                  <X size={14} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Quick-add presets + custom */}
      <div className="flex flex-wrap gap-1.5 pt-1">
        {PRESETS.filter(p => !value.some(c => c.hex.toLowerCase() === p.hex.toLowerCase())).map(p => (
          <button
            type="button" key={p.hex}
            onClick={() => add(p)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-100 hover:bg-brand-accent/10 hover:text-brand-accent text-gray-600 text-xs font-bold rounded-full transition-colors"
          >
            <span className="w-3 h-3 rounded-full border border-white shadow-sm" style={{ backgroundColor: p.hex }} />
            {p.name}
          </button>
        ))}
        <button
          type="button"
          onClick={() => add()}
          className="flex items-center gap-1 px-2.5 py-1.5 border border-dashed border-gray-300 hover:border-brand-accent text-gray-600 hover:text-brand-accent text-xs font-bold rounded-full transition-colors"
        >
          <Plus size={12} /> Custom
        </button>
      </div>

      {value.length > 0 && (
        <p className="text-xs text-gray-400">
          The first color is the default. Price delta is added/subtracted from the base product price.
        </p>
      )}
    </div>
  );
}
