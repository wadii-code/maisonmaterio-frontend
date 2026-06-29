import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, ArrowLeft, CheckCircle, Loader2, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useI18n } from '../stores/i18nStore';
import { Button } from '../components/ui/Button';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

type Mode = 'signin' | 'signup' | 'forgot' | 'reset';
// Recovery (reset-link) lifecycle: did we manage to establish a recovery session?
type Recovery = 'idle' | 'verifying' | 'ready' | 'error';

export function Auth() {
  const [mode, setMode] = useState<Mode>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', confirm: '', fullName: '' });
  const [submitting, setSubmitting] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [recovery, setRecovery] = useState<Recovery>('idle');
  const { signIn, signUp, signOut, loading } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') ?? '/';
  const { t } = useI18n();

  // Detect & establish a Supabase password-recovery session from the email link.
  // The reset link can arrive in several shapes depending on Supabase's flow:
  //   • implicit:    #access_token=...&type=recovery            (default — auto-parsed by the client)
  //   • PKCE:        ?code=...                                   (needs exchangeCodeForSession)
  //   • token_hash:  ?token_hash=...&type=recovery               (needs verifyOtp — works cross-device)
  //   • error:       #error_description=...  /  ?error_description=...
  // We normalise all of them into a single `recovery` state so the form only
  // lets the user submit once a valid recovery session actually exists.
  useEffect(() => {
    let cancelled = false;

    const url = new URL(window.location.href);
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));

    const code = url.searchParams.get('code');
    const tokenHash = url.searchParams.get('token_hash');
    const queryType = url.searchParams.get('type');
    const hasRecoveryHash = hashParams.get('type') === 'recovery' || !!hashParams.get('access_token');
    const wantsReset =
      url.searchParams.get('mode') === 'reset' || location.pathname.includes('reset-password');
    const errorDescription =
      hashParams.get('error_description') ?? url.searchParams.get('error_description');

    const anyRecoverySignal =
      !!code || !!tokenHash || hasRecoveryHash || wantsReset || !!errorDescription;
    if (anyRecoverySignal) setMode('reset');

    // The client (detectSessionInUrl: true) parses the implicit hash automatically
    // and emits PASSWORD_RECOVERY once the recovery session is live.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' && !cancelled) {
        setMode('reset');
        setRecovery('ready');
      }
      if (event === 'SIGNED_IN' && session && !cancelled && anyRecoverySignal) {
        setRecovery('ready');
      }
    });

    async function establish() {
      // Supabase returned an explicit error in the link (expired / already used).
      if (errorDescription) {
        if (!cancelled) { setMode('reset'); setRecovery('error'); }
        return;
      }

      // token_hash flow — verify the one-time recovery token.
      if (tokenHash && (queryType === 'recovery' || !queryType)) {
        setMode('reset'); setRecovery('verifying');
        const { error } = await supabase.auth.verifyOtp({ type: 'recovery', token_hash: tokenHash });
        if (cancelled) return;
        setRecovery(error ? 'error' : 'ready');
        window.history.replaceState(null, '', '/auth?mode=reset');
        return;
      }

      // PKCE code flow — exchange the code for a session.
      if (code) {
        setMode('reset'); setRecovery('verifying');
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (cancelled) return;
        setRecovery(error ? 'error' : 'ready');
        window.history.replaceState(null, '', '/auth?mode=reset');
        return;
      }

      // Implicit hash flow — the client auto-parses it; confirm a session exists.
      if (hasRecoveryHash || wantsReset) {
        setMode('reset'); setRecovery('verifying');
        // Give detectSessionInUrl a moment, then check.
        const { data } = await supabase.auth.getSession();
        if (cancelled) return;
        if (data.session) {
          setRecovery('ready');
        } else if (hasRecoveryHash) {
          // We had a recovery hash but no session materialised → bad/expired token.
          setRecovery('error');
        }
        // For a bare ?mode=reset with no token yet, stay in 'verifying' and let the
        // PASSWORD_RECOVERY event flip us to 'ready'.
      }
    }

    establish();

    return () => { cancelled = true; subscription.unsubscribe(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    // A valid recovery session is required before we can change the password.
    if (recovery !== 'ready') {
      toast.error(t('auth.invalidResetLink'));
      setRecovery('error');
      return;
    }
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
      // Sign the user out so they must log in with the brand-new password, then
      // send them to the sign-in screen with a success message.
      await signOut().catch(() => {});
      toast.success(t('auth.resetSuccess'));
      window.history.replaceState(null, '', '/auth');
      setMode('signin');
      setRecovery('idle');
      setForm({ email: '', password: '', confirm: '', fullName: '' });
    } catch (err: any) {
      toast.error(err.message ?? t('auth.invalidResetLink'));
    } finally {
      setSubmitting(false);
    }
  };

  const startNewReset = () => {
    window.history.replaceState(null, '', '/auth');
    setRecovery('idle');
    setResetSent(false);
    setForm({ email: '', password: '', confirm: '', fullName: '' });
    setMode('forgot');
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
      <Helmet><title>{heading} — Maison Materiau</title></Helmet>
      <div className="min-h-screen bg-brand-card flex">
        {/* Visual side */}
        <div className="hidden lg:flex w-1/2 relative bg-brand-dark items-center justify-center overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80"
            alt="Maison Materiau interior"
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
          <div className="relative z-10 text-center px-12">
            <h1 className="text-6xl font-black text-white mb-4">Maison Materiau</h1>
            <p className="text-white/60 text-lg">Illuminez votre espace</p>
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
                  <motion.div
                    key="reset"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  >
                    {recovery === 'verifying' ? (
                      <div className="text-center py-8">
                        <Loader2 size={32} className="mx-auto text-brand-accent animate-spin mb-4" />
                        <p className="text-sm font-semibold text-gray-500">{t('auth.verifyingLink')}</p>
                      </div>
                    ) : recovery === 'error' ? (
                      <div className="text-center py-4">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                          <AlertTriangle size={30} className="text-red-500" />
                        </div>
                        <p className="font-bold text-brand-heading mb-1">{t('auth.linkExpiredTitle')}</p>
                        <p className="text-sm text-gray-400 mb-6">{t('auth.linkExpiredBody')}</p>
                        <Button variant="primary" size="lg" fullWidth onClick={startNewReset}>
                          {t('auth.requestNewLink')}
                        </Button>
                        <button type="button" onClick={() => { setRecovery('idle'); setMode('signin'); }}
                          className="mt-3 w-full inline-flex items-center justify-center gap-2 text-sm font-semibold text-gray-500 hover:text-brand-accent transition-colors"
                        >
                          <ArrowLeft size={14} /> {t('auth.backToSignIn')}
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleReset} className="space-y-4">
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
                        <Button type="submit" variant="primary" size="lg" fullWidth loading={submitting} disabled={recovery !== 'ready'}>
                          {t('auth.updatePassword')}
                        </Button>
                      </form>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}
