import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useI18n } from '../stores/i18nStore';
import { Button } from '../components/ui/Button';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

type Mode = 'signin' | 'signup' | 'forgot' | 'reset';

export function Auth() {
  const [mode, setMode] = useState<Mode>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', confirm: '', fullName: '' });
  const [submitting, setSubmitting] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const { signIn, signUp, loading } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') ?? '/';
  const { t } = useI18n();

  // Detect Supabase password recovery — Supabase fires PASSWORD_RECOVERY on auth state change
  // when the user clicks the email reset link (which contains a hash with access_token + type=recovery).
  useEffect(() => {
    const hash = window.location.hash;
    const isRecoveryUrl =
      hash.includes('type=recovery') ||
      searchParams.get('mode') === 'reset' ||
      location.pathname.includes('reset-password');

    if (isRecoveryUrl) setMode('reset');

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setMode('reset');
    });
    return () => subscription.unsubscribe();
  }, [location, searchParams]);

  const setField = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSignInUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (mode === 'signin') {
        await signIn(form.email, form.password);
        toast.success(t('auth.welcomeBackToast'));
        navigate(redirect);
      } else if (mode === 'signup') {
        await signUp(form.email, form.password, form.fullName);
        toast.success(t('auth.accountCreatedToast'));
        navigate(redirect);
      }
    } catch (err: any) {
      toast.error(err.message ?? t('auth.authFailed'));
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email) return;
    setSubmitting(true);
    try {
      const redirectTo = `${window.location.origin}/auth?mode=reset`;
      const { error } = await supabase.auth.resetPasswordForEmail(form.email, { redirectTo });
      if (error) throw error;
      setResetSent(true);
      toast.success(t('auth.resetEmailSent'));
    } catch (err: any) {
      toast.error(err.message ?? t('auth.authFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 6) {
      toast.error(t('auth.passwordTooShort'));
      return;
    }
    if (form.password !== form.confirm) {
      toast.error(t('auth.passwordsMismatch'));
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: form.password });
      if (error) throw error;
      toast.success(t('auth.resetSuccess'));
      // Clean up hash + send to sign in
      window.history.replaceState(null, '', '/auth');
      setMode('signin');
      setForm({ email: '', password: '', confirm: '', fullName: '' });
    } catch (err: any) {
      toast.error(err.message ?? t('auth.invalidResetLink'));
    } finally {
      setSubmitting(false);
    }
  };

  const heading =
    mode === 'signin'  ? t('auth.welcomeBack')
    : mode === 'signup' ? t('auth.createAccount')
    : mode === 'forgot' ? t('auth.forgotTitle')
    :                     t('auth.resetTitle');

  const subheading =
    mode === 'signin'  ? t('auth.signInSubtitle')
    : mode === 'signup' ? t('auth.signUpSubtitle')
    : mode === 'forgot' ? t('auth.forgotSubtitle')
    :                     t('auth.resetSubtitle');

  return (
    <>
      <Helmet><title>{heading} — SWIPO</title></Helmet>
      <div className="min-h-screen bg-brand-card flex">
        {/* Visual side */}
        <div className="hidden lg:flex w-1/2 relative bg-brand-dark items-center justify-center overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80"
            alt="SWIPO interior"
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
          <div className="relative z-10 text-center px-12">
            <h1 className="text-6xl font-black text-white mb-4">SWIPO</h1>
            <p className="text-white/60 text-lg">Illuminate Your Space</p>
          </div>
        </div>

        {/* Form side */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-8 shadow-sm"
            >
              <div className="mb-8">
                <h2 className="text-2xl font-black text-brand-heading">{heading}</h2>
                <p className="text-gray-400 text-sm mt-1">{subheading}</p>
              </div>

              {/* Toggle (only for signin/signup) */}
              {(mode === 'signin' || mode === 'signup') && (
                <div className="flex bg-gray-100 p-1 rounded-full mb-8">
                  {(['signin', 'signup'] as const).map(m => (
                    <button
                      key={m} type="button"
                      onClick={() => setMode(m)}
                      className={`flex-1 py-2.5 text-sm font-bold rounded-full transition-all ${
                        mode === m ? 'bg-white text-brand-heading shadow-sm' : 'text-gray-400'
                      }`}
                    >
                      {m === 'signin' ? t('auth.signIn') : t('auth.register')}
                    </button>
                  ))}
                </div>
              )}

              <AnimatePresence mode="wait">
                {/* SIGN IN / SIGN UP */}
                {(mode === 'signin' || mode === 'signup') && (
                  <motion.form
                    key="signin-up" onSubmit={handleSignInUp}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    {mode === 'signup' && (
                      <div className="relative">
                        <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text" required
                          placeholder={t('auth.fullName')}
                          value={form.fullName}
                          onChange={e => setField('fullName', e.target.value)}
                          className="w-full pl-11 pr-4 py-3.5 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-brand-accent transition-colors text-sm"
                        />
                      </div>
                    )}
                    <div className="relative">
                      <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email" required
                        placeholder={t('auth.email')}
                        value={form.email}
                        onChange={e => setField('email', e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-brand-accent transition-colors text-sm"
                      />
                    </div>
                    <div className="relative">
                      <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'} required minLength={6}
                        placeholder={t('auth.password')}
                        value={form.password}
                        onChange={e => setField('password', e.target.value)}
                        className="w-full pl-11 pr-12 py-3.5 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-brand-accent transition-colors text-sm"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>

                    {mode === 'signin' && (
                      <div className="flex justify-end">
                        <button type="button" onClick={() => { setResetSent(false); setMode('forgot'); }}
                          className="text-xs font-semibold text-brand-accent hover:underline"
                        >
                          {t('auth.forgotPassword')}
                        </button>
                      </div>
                    )}

                    <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
                      {mode === 'signin' ? t('auth.signInBtn') : t('auth.createAccountBtn')}
                    </Button>
                  </motion.form>
                )}

                {/* FORGOT PASSWORD */}
                {mode === 'forgot' && (
                  <motion.div
                    key="forgot"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  >
                    {resetSent ? (
                      <div className="text-center py-4">
                        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <CheckCircle size={32} className="text-emerald-500" />
                        </div>
                        <p className="font-bold text-brand-heading mb-1">{t('auth.resetEmailSent')}</p>
                        <p className="text-sm text-gray-400 mb-6">{form.email}</p>
                        <button type="button" onClick={() => { setMode('signin'); setResetSent(false); }}
                          className="inline-flex items-center gap-2 text-sm font-bold text-brand-accent hover:underline"
                        >
                          <ArrowLeft size={14} /> {t('auth.backToSignIn')}
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleForgot} className="space-y-4">
                        <div className="relative">
                          <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="email" required
                            placeholder={t('auth.email')}
                            value={form.email}
                            onChange={e => setField('email', e.target.value)}
                            className="w-full pl-11 pr-4 py-3.5 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-brand-accent transition-colors text-sm"
                          />
                        </div>
                        <Button type="submit" variant="primary" size="lg" fullWidth loading={submitting}>
                          {t('auth.sendResetLink')}
                        </Button>
                        <button type="button" onClick={() => setMode('signin')}
                          className="w-full inline-flex items-center justify-center gap-2 text-sm font-semibold text-gray-500 hover:text-brand-accent transition-colors"
                        >
                          <ArrowLeft size={14} /> {t('auth.backToSignIn')}
                        </button>
                      </form>
                    )}
                  </motion.div>
                )}

                {/* RESET PASSWORD */}
                {mode === 'reset' && (
                  <motion.form
                    key="reset" onSubmit={handleReset}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <div className="relative">
                      <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'} required minLength={6}
                        placeholder={t('auth.newPassword')}
                        value={form.password}
                        onChange={e => setField('password', e.target.value)}
                        className="w-full pl-11 pr-12 py-3.5 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-brand-accent transition-colors text-sm"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <div className="relative">
                      <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'} required minLength={6}
                        placeholder={t('auth.confirmPassword')}
                        value={form.confirm}
                        onChange={e => setField('confirm', e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-brand-accent transition-colors text-sm"
                      />
                    </div>
                    <Button type="submit" variant="primary" size="lg" fullWidth loading={submitting}>
                      {t('auth.updatePassword')}
                    </Button>
                  </motion.form>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}
