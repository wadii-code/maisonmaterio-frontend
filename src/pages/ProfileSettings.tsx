import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Save, ChevronLeft, KeyRound } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import toast from 'react-hot-toast';

export function ProfileSettings() {
  const { user, profile, refreshProfile, signOut } = useAuthStore();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ full_name: '', phone: '' });

  useEffect(() => {
    if (profile) setForm({ full_name: profile.full_name ?? '', phone: profile.phone ?? '' });
  }, [profile]);

  if (!user) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Connectez-vous pour gérer votre profil.</p>
          <Button variant="primary" onClick={() => navigate('/auth?redirect=/account/profile')}>Connexion</Button>
        </div>
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from('profiles').update({
      full_name: form.full_name.trim() || null,
      phone: form.phone.trim() || null,
    }).eq('id', user.id);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    await refreshProfile();
    toast.success('Profil mis à jour');
  };

  const handlePasswordReset = async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(user.email!, {
      redirectTo: `${window.location.origin}/auth?mode=reset`,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`E-mail de réinitialisation envoyé à ${user.email}`);
  };

  return (
    <>
      <Helmet><title>Paramètres du profil — Maison Materiau</title></Helmet>
      <div className="pt-20 min-h-screen bg-brand-card">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <Link to="/account" className="inline-flex items-center gap-1 text-sm font-bold text-gray-500 hover:text-brand-accent transition-colors mb-6">
            <ChevronLeft size={16} /> Retour au compte
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div>
              <h1 className="text-3xl lg:text-4xl font-black text-brand-heading">Paramètres du profil</h1>
              <p className="text-gray-500 mt-2 text-sm">Mettez à jour vos informations personnelles et la sécurité de votre compte.</p>
            </div>

            {/* Avatar + role */}
            <div className="bg-white rounded-3xl p-6 flex items-center gap-4">
              <div className="w-16 h-16 bg-brand-accent/10 rounded-full flex items-center justify-center text-2xl font-black text-brand-accent shrink-0">
                {form.full_name?.[0]?.toUpperCase() ?? user.email?.[0]?.toUpperCase() ?? '?'}
              </div>
              <div className="min-w-0">
                <p className="font-black text-brand-heading truncate">{form.full_name || 'Ajoutez votre nom'}</p>
                <p className="text-sm text-gray-400 truncate flex items-center gap-1.5"><Mail size={12} /> {user.email}</p>
                {(profile?.role === 'admin' || profile?.role === 'super_admin' || profile?.role === 'sub_admin') && (
                  <span className="inline-block mt-1 px-2 py-0.5 bg-brand-accent text-white text-[10px] font-black rounded uppercase tracking-wider">
                    {profile?.role === 'sub_admin' ? 'Sous-admin' : 'Admin'}
                  </span>
                )}
              </div>
            </div>

            {/* Personal info form */}
            <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 space-y-5">
              <h2 className="font-black text-brand-heading flex items-center gap-2">
                <User size={18} className="text-brand-accent" /> Informations personnelles
              </h2>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Nom complet</label>
                <input
                  type="text" value={form.full_name}
                  onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-brand-accent text-sm"
                  placeholder="Votre nom complet"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">E-mail</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email" value={user.email ?? ''} disabled
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-100 rounded-xl text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1.5">L'e-mail ne peut pas être modifié</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Téléphone</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel" value={form.phone}
                    onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-brand-accent text-sm"
                    placeholder="+212 645-104432"
                  />
                </div>
              </div>

              <Button type="submit" variant="primary" loading={saving}>
                <Save size={14} /> Enregistrer
              </Button>
            </form>

            {/* Security */}
            <div className="bg-white rounded-3xl p-6 space-y-5">
              <h2 className="font-black text-brand-heading flex items-center gap-2">
                <KeyRound size={18} className="text-brand-accent" /> Sécurité
              </h2>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p className="font-bold text-brand-heading text-sm">Mot de passe</p>
                  <p className="text-xs text-gray-500 mt-0.5">Nous vous enverrons un e-mail avec un lien de réinitialisation.</p>
                </div>
                <Button variant="outline" size="sm" onClick={handlePasswordReset}>Envoyer le lien</Button>
              </div>
            </div>

            {/* Danger zone */}
            <div className="bg-white rounded-3xl p-6 border-2 border-red-100">
              <h2 className="font-black text-red-600 mb-1">Déconnexion</h2>
              <p className="text-xs text-gray-500 mb-4">Vous devrez vous reconnecter sur cet appareil.</p>
              <Button variant="outline" onClick={async () => { await signOut(); navigate('/'); }}>
                Se déconnecter
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
