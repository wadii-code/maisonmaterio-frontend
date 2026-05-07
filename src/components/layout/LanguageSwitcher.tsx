import { Globe } from 'lucide-react';
import { useI18n } from '../../stores/i18nStore';

interface Props {
  variant?: 'light' | 'dark';
  className?: string;
}

/**
 * Manual EN ↔ FR toggle. Persists in localStorage via the i18n store.
 */
export function LanguageSwitcher({ variant = 'dark', className = '' }: Props) {
  const { locale, toggle } = useI18n();
  const isLight = variant === 'light';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch language (current: ${locale === 'en' ? 'English' : 'Français'})`}
      title={locale === 'en' ? 'Switch to Français' : 'Passer en English'}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
        isLight
          ? 'text-white/90 hover:text-white border border-white/30 hover:border-white/60'
          : 'text-brand-text hover:text-brand-accent border border-gray-200 hover:border-brand-accent'
      } ${className}`}
    >
      <Globe size={14} />
      <span>{locale === 'en' ? 'EN' : 'FR'}</span>
      <span className="opacity-40">|</span>
      <span className="opacity-50">{locale === 'en' ? 'FR' : 'EN'}</span>
    </button>
  );
}
