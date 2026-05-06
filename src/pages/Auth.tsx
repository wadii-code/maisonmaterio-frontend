import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { Button } from '../components/ui/Button';
import toast from 'react-hot-toast';

export function Auth() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', fullName: '' });
  const { signIn, signUp, loading } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') ?? '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (mode === 'signin') {
        await signIn(form.email, form.password);
        toast.success('Welcome back!');
      } else {
        await signUp(form.email, form.password, form.fullName);
        toast.success('Account created! Please check your email.');
      }
      navigate(redirect);
    } catch (err: any) {
      toast.error(err.message ?? 'Authentication failed');
    }
  };

  const setField = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }));

  return (
    <>
      <Helmet><title>{mode === 'signin' ? 'Sign In' : 'Create Account'} — SWIPO</title></Helmet>
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-8 shadow-sm"
            >
              <div className="mb-8">
                <h2 className="text-2xl font-black text-brand-heading">
                  {mode === 'signin' ? 'Welcome back' : 'Create your account'}
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  {mode === 'signin' ? 'Sign in to your SWIPO account' : 'Join SWIPO today'}
                </p>
              </div>

              {/* Toggle */}
              <div className="flex bg-gray-100 p-1 rounded-full mb-8">
                {(['signin', 'signup'] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`flex-1 py-2.5 text-sm font-bold rounded-full transition-all ${
                      mode === m ? 'bg-white text-brand-heading shadow-sm' : 'text-gray-400'
                    }`}
                  >
                    {m === 'signin' ? 'Sign In' : 'Register'}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <AnimatePresence>
                  {mode === 'signup' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <div className="relative">
                        <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text" required
                          placeholder="Full Name"
                          value={form.fullName}
                          onChange={e => setField('fullName', e.target.value)}
                          className="w-full pl-11 pr-4 py-3.5 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-brand-accent transition-colors text-sm"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email" required
                    placeholder="Email address"
                    value={form.email}
                    onChange={e => setField('email', e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-brand-accent transition-colors text-sm"
                  />
                </div>

                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'} required minLength={6}
                    placeholder="Password"
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

                <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
                  {mode === 'signin' ? 'Sign In' : 'Create Account'}
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}
