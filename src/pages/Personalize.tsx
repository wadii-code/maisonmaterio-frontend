import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { MessageCircle, User, Phone, Tag, Sparkles, ArrowRight } from 'lucide-react';
import { useCategories } from '../hooks/useProducts';
import { useI18n } from '../stores/i18nStore';
import { Button } from '../components/ui/Button';
import toast from 'react-hot-toast';

// Set this to your business WhatsApp number in international format (no '+', no spaces).
// Override at build time via VITE_WHATSAPP_NUMBER if you prefer.
const WHATSAPP_NUMBER = (import.meta.env.VITE_WHATSAPP_NUMBER as string | undefined) ?? '212600000000';

export function Personalize() {
  const { t, locale } = useI18n();
  const { data: categories, isLoading: catsLoading } = useCategories();

  const [form, setForm] = useState({
    category: '',
    fullName: '',
    phone: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const setField = <K extends keyof typeof form>(k: K, v: string) =>
    setForm(p => ({ ...p, [k]: v }));

  const validate = (): string | null => {
    if (!form.category) return t('personalize.missingCategory');
    if (form.fullName.trim().length < 2) return t('personalize.missingName');
    // Loose phone check: at least 7 digits, allow + space - ()
    const digits = form.phone.replace(/[^\d]/g, '');
    if (digits.length < 7) return t('personalize.invalidPhone');
    if (form.message.trim().length < 10) return t('personalize.tooShortMessage');
    return null;
  };

  const buildWhatsAppLink = (): string => {
    const lines = [
      locale === 'fr' ? '🎯 *Demande de personnalisation Maison Materio*' : '🎯 *Maison Materio Personalization Request*',
      '',
      `*${t('personalize.fullName')}:* ${form.fullName.trim()}`,
      `*${t('personalize.phone')}:* ${form.phone.trim()}`,
      `*${t('personalize.category')}:* ${form.category}`,
      '',
      `*${t('personalize.message')}:*`,
      form.message.trim(),
    ];
    const text = encodeURIComponent(lines.join('\n'));
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      toast.error(err);
      return;
    }
    setSubmitting(true);
    toast.success(t('personalize.openWhatsApp'));
    const url = buildWhatsAppLink();
    // Use window.open so mobile WhatsApp app & desktop both handle it gracefully
    window.open(url, '_blank', 'noopener,noreferrer');
    setTimeout(() => setSubmitting(false), 800);
  };

  return (
    <>
      <Helmet><title>{t('personalize.title')} — Maison Materio</title></Helmet>
      <div className="pt-20 min-h-screen bg-brand-card">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10 lg:mb-14"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-accent/10 text-brand-accent rounded-full text-xs font-bold uppercase tracking-wider mb-4">
              <Sparkles size={14} /> Maison Materio Custom
            </div>
            <h1 className="text-3xl lg:text-5xl font-black text-brand-heading mb-3">
              {t('personalize.title')}
            </h1>
            <p className="text-gray-500 max-w-2xl mx-auto">{t('personalize.subtitle')}</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Form */}
            <motion.form
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              onSubmit={handleSubmit}
              className="lg:col-span-2 bg-white rounded-3xl p-6 lg:p-8 space-y-5"
            >
              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  {t('personalize.category')}
                </label>
                <div className="relative">
                  <Tag size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <select
                    value={form.category}
                    onChange={e => setField('category', e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3.5 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-brand-accent transition-colors text-sm appearance-none bg-white"
                  >
                    <option value="" disabled>
                      {catsLoading ? t('common.loading') : t('personalize.categoryPlaceholder')}
                    </option>
                    {categories?.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  {t('personalize.fullName')}
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text" required minLength={2}
                    placeholder={t('personalize.fullNamePlaceholder')}
                    value={form.fullName}
                    onChange={e => setField('fullName', e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-brand-accent transition-colors text-sm"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  {t('personalize.phone')}
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel" required
                    placeholder={t('personalize.phonePlaceholder')}
                    value={form.phone}
                    onChange={e => setField('phone', e.target.value)}
                    pattern="[\d\s\+\-\(\)]{7,20}"
                    className="w-full pl-11 pr-4 py-3.5 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-brand-accent transition-colors text-sm"
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  {t('personalize.message')}
                </label>
                <textarea
                  required minLength={10} maxLength={1000} rows={6}
                  placeholder={t('personalize.messagePlaceholder')}
                  value={form.message}
                  onChange={e => setField('message', e.target.value)}
                  className="w-full px-4 py-3.5 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-brand-accent transition-colors text-sm resize-y"
                />
                <p className="text-xs text-gray-400 mt-1.5">
                  {form.message.length}/1000
                </p>
              </div>

              <Button type="submit" variant="primary" size="lg" fullWidth loading={submitting}>
                <MessageCircle size={18} /> {t('personalize.submit')} <ArrowRight size={16} />
              </Button>
            </motion.form>

            {/* How it works */}
            <motion.aside
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-brand-dark to-brand-heading text-white rounded-3xl p-6 lg:p-8 h-fit"
            >
              <h3 className="font-black text-lg mb-5 flex items-center gap-2">
                <Sparkles size={18} className="text-brand-accent" />
                {t('personalize.howItWorks')}
              </h3>
              <ol className="space-y-5">
                {[
                  t('personalize.step1'),
                  t('personalize.step2'),
                  t('personalize.step3'),
                ].map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="shrink-0 w-7 h-7 rounded-full bg-brand-accent text-white text-xs font-black flex items-center justify-center">
                      {i + 1}
                    </span>
                    <span className="text-sm text-white/80 leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
              <div className="mt-6 pt-6 border-t border-white/10 flex items-center gap-3 text-sm text-white/70">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <MessageCircle size={18} className="text-emerald-400" />
                </div>
                <span>WhatsApp · +{WHATSAPP_NUMBER}</span>
              </div>
            </motion.aside>
          </div>
        </div>
      </div>
    </>
  );
}
