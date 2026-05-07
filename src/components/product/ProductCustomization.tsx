import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

export interface CustomizationOption {
  type: 'color' | 'size' | 'select';
  label: string;
  options: { value: string; label: string; priceDelta?: number; swatch?: string }[];
}

interface ProductCustomizationProps {
  basePrice: number;
  options?: CustomizationOption[];
  onChange: (selections: Record<string, string>, totalPrice: number) => void;
}

export function ProductCustomization({ basePrice, options, onChange }: ProductCustomizationProps) {
  const opts = options ?? [];
  const hasOptions = opts.length > 0;

  const [selections, setSelections] = useState<Record<string, string>>(() =>
    hasOptions ? Object.fromEntries(opts.map(o => [o.label, o.options[0].value])) : {}
  );

  const totalPrice = useMemo(() => {
    let total = basePrice;
    for (const opt of opts) {
      const selected = opt.options.find(o => o.value === selections[opt.label]);
      if (selected?.priceDelta) total += selected.priceDelta;
    }
    return total;
  }, [basePrice, opts, selections]);

  useEffect(() => { onChange(selections, totalPrice); }, [selections, totalPrice, onChange]);

  if (!hasOptions) return null;

  const setSelection = (label: string, value: string) => {
    setSelections(prev => ({ ...prev, [label]: value }));
  };

  return (
    <div className="space-y-5">
      {opts.map(opt => (
        <div key={opt.label}>
          <div className="flex items-center justify-between mb-2.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{opt.label}</label>
            <span className="text-sm font-semibold text-brand-heading">
              {opt.options.find(o => o.value === selections[opt.label])?.label}
            </span>
          </div>

          {opt.type === 'color' ? (
            <div className="flex flex-wrap gap-2">
              {opt.options.map(option => {
                const isSelected = selections[opt.label] === option.value;
                return (
                  <motion.button
                    key={option.value}
                    onClick={() => setSelection(opt.label, option.value)}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    title={`${option.label}${option.priceDelta ? ` (${option.priceDelta > 0 ? '+' : ''}${option.priceDelta} MAD)` : ''}`}
                    className={`relative w-10 h-10 rounded-full border-2 transition-all ${
                      isSelected ? 'border-brand-accent ring-2 ring-brand-accent/30 ring-offset-2' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    style={{ backgroundColor: option.swatch }}
                  >
                    {isSelected && (
                      <Check size={14} className={`absolute inset-0 m-auto ${
                        option.swatch === '#1a1a1a' || option.swatch === '#5d4037' ? 'text-white' : 'text-brand-dark'
                      }`} strokeWidth={3} />
                    )}
                  </motion.button>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {opt.options.map(option => {
                const isSelected = selections[opt.label] === option.value;
                return (
                  <motion.button
                    key={option.value}
                    onClick={() => setSelection(opt.label, option.value)}
                    whileTap={{ scale: 0.97 }}
                    className={`px-4 py-2 text-sm font-semibold rounded-full border-2 transition-all ${
                      isSelected
                        ? 'border-brand-accent bg-brand-accent text-white'
                        : 'border-gray-200 text-brand-text hover:border-brand-accent'
                    }`}
                  >
                    {option.label}
                    {option.priceDelta !== undefined && option.priceDelta !== 0 && (
                      <span className={`ml-1.5 text-xs ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>
                        {option.priceDelta > 0 ? '+' : ''}{option.priceDelta} MAD
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
