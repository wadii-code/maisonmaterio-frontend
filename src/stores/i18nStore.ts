import { create } from 'zustand';
import { translations, type Locale, type TranslationKey } from '../lib/translations';

const STORAGE_KEY = 'swipo-locale';

function loadLocale(): Locale {
  // SWIPO is French-only. The store still exists so existing `t('…')` calls
  // keep working, but there is no longer any way to switch to English.
  // Clear any old preference left over from when the toggle existed.
  if (typeof window !== 'undefined') {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }
  return 'fr';
}

interface I18nState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggle: () => void;
  t: (key: TranslationKey) => string;
}

export const useI18nStore = create<I18nState>((set, get) => ({
  locale: loadLocale(),

  setLocale: (_locale) => {
    // Locked to French. No-op so any lingering callers don't break.
  },

  toggle: () => {
    // Locked to French. No-op.
  },

  t: (key) => {
    const dict = translations[get().locale] as Record<string, string>;
    return dict[key] ?? translations.en[key] ?? key;
  },
}));

/** Convenient hook that returns a re-render-safe `t` function. */
export function useI18n() {
  const locale = useI18nStore(s => s.locale);
  const setLocale = useI18nStore(s => s.setLocale);
  const toggle = useI18nStore(s => s.toggle);
  // The `t` function depends on `locale` — re-derive on each render so consumers re-render on switch.
  const t = (key: TranslationKey): string => {
    const dict = translations[locale] as Record<string, string>;
    return dict[key] ?? translations.en[key] ?? key;
  };
  return { locale, setLocale, toggle, t };
}
