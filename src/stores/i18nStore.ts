import { create } from 'zustand';
import { translations, type Locale, type TranslationKey } from '../lib/translations';

const STORAGE_KEY = 'swipo-locale';

function loadLocale(): Locale {
  // French is the default — only switch to English if the user explicitly chose it.
  if (typeof window === 'undefined') return 'fr';
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved === 'en' ? 'en' : 'fr';
}

interface I18nState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggle: () => void;
  t: (key: TranslationKey) => string;
}

export const useI18nStore = create<I18nState>((set, get) => ({
  locale: loadLocale(),

  setLocale: (locale) => {
    localStorage.setItem(STORAGE_KEY, locale);
    document.documentElement.lang = locale;
    set({ locale });
  },

  toggle: () => {
    const next: Locale = get().locale === 'en' ? 'fr' : 'en';
    get().setLocale(next);
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
