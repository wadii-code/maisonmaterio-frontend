import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, MapPin, Plus, Pencil, Trash2, Save, X, Star } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import toast from 'react-hot-toast';

interface Address {
  id: string;
  label: string | null;
  full_name: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string;
  is_default: boolean;
}

const EMPTY_FORM = {
  label: 'Domicile',
  full_name: '',
  address_line1: '',
  address_line2: '',
  city: '',
  state: '',
  postal_code: '',
  country: 'Maroc',
  phone: '',
  is_default: false,
};

export function SavedAddresses() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    loadAddresses();
  }, [user]);

  const loadAddresses = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', user!.id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setAddresses((data ?? []) as Address[]);
  };

  if (!user) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Connectez-vous pour gérer vos adresses enregistrées.</p>
          <Button variant="primary" onClick={() => navigate('/auth?redirect=/account/addresses')}>Connexion</Button>
        </div>
      </div>
    );
  }

  const openNew = () => { setEditing(null); setForm(EMPTY_FORM); setModalOpen(true); };
  const openEdit = (a: Address) => {
    setEditing(a);
    setForm({
      label: a.label ?? 'Domicile',
      full_name: a.full_name,
      address_line1: a.address_line1,
      address_line2: a.address_line2 ?? '',
      city: a.city,
      state: a.state,
      postal_code: a.postal_code,
      country: a.country,
      phone: a.phone,
      is_default: a.is_default,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      label: form.label.trim() || null,
      address_line2: form.address_line2.trim() || null,
      user_id: user.id,
    };

    // If marking this as default, clear the flag on others first
    if (payload.is_default) {
      await supabase.from('addresses').update({ is_default: false }).eq('user_id', user.id);
    }

    const { error } = editing
      ? await supabase.from('addresses').update(payload).eq('id', editing.id)
      : await supabase.from('addresses').insert(payload);
    setSaving(false);

    if (error) { toast.error(error.message); return; }
    toast.success(editing ? 'Adresse mise à jour' : 'Adresse ajoutée');
    setModalOpen(false);
    loadAddresses();
  };

  const handleDelete = async (a: Address) => {
    if (!confirm(`Supprimer l'adresse « ${a.label ?? 'adresse'} » ?`)) return;
    const { error } = await supabase.from('addresses').delete().eq('id', a.id);
    if (error) { toast.error(error.message); return; }
    toast.success('Adresse supprimée');
    loadAddresses();
  };

  const handleSetDefault = async (a: Address) => {
    await supabase.from('addresses').update({ is_default: false }).eq('user_id', user.id);
    const { error } = await supabase.from('addresses').update({ is_default: true }).eq('id', a.id);
    if (error) { toast.error(error.message); return; }
    toast.success(`${a.label ?? 'Adresse'} définie par défaut`);
    loadAddresses();
  };

  return (
    <>
      <Helmet><title>Adresses enregistrées — Maison Materiau</title></Helmet>
      <div className="pt-20 min-h-screen bg-brand-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <Link to="/account" className="inline-flex items-center gap-1 text-sm font-bold text-gray-500 hover:text-brand-accent transition-colors mb-6">
            <ChevronLeft size={16} /> Retour au compte
          </Link>

          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-black text-brand-heading">Adresses enregistrées</h1>
              <p className="text-gray-500 mt-2 text-sm">{addresses.length} {addresses.length === 1 ? 'adresse enregistrée' : 'adresses enregistrées'}</p>
            </div>
            <Button variant="primary" onClick={openNew}>
              <Plus size={16} /> Ajouter une adresse
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}
            </div>
          ) : addresses.length === 0 ? (
            <div className="bg-white rounded-3xl py-16 px-6 text-center">
              <MapPin size={36} className="mx-auto text-gray-300 mb-3" />
              <p className="font-bold text-brand-heading mb-1">Aucune adresse enregistrée</p>
              <p className="text-sm text-gray-400 mb-6">Ajoutez-en une pour accélérer vos commandes.</p>
              <Button variant="primary" onClick={openNew}><Plus size={16} /> Ajouter ma première adresse</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AnimatePresence mode="popLayout">
                {addresses.map(a => (
                  <motion.div
                    key={a.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={`bg-white rounded-2xl p-5 relative ${a.is_default ? 'ring-2 ring-brand-accent' : ''}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-brand-heading">{a.label ?? 'Adresse'}</span>
                        {a.is_default && (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-brand-accent/10 text-brand-accent text-[10px] font-black rounded-full">
                            <Star size={10} className="fill-brand-accent" /> PAR DÉFAUT
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-gray-700 space-y-0.5">
                      <p className="font-semibold">{a.full_name}</p>
                      <p>{a.address_line1}</p>
                      {a.address_line2 && <p>{a.address_line2}</p>}
                      <p>{a.city}, {a.state} {a.postal_code}</p>
                      <p>{a.country}</p>
                      <p className="text-gray-500 pt-1">{a.phone}</p>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-4 pt-4 border-t border-gray-100">
                      {!a.is_default && (
                        <button onClick={() => handleSetDefault(a)} className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs font-bold text-brand-accent hover:bg-brand-accent/10 rounded-lg transition-colors">
                          <Star size={12} /> Par défaut
                        </button>
                      )}
                      <button onClick={() => openEdit(a)} className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs font-bold text-brand-text hover:bg-gray-50 rounded-lg transition-colors">
                        <Pencil size={12} /> Modifier
                      </button>
                      <button onClick={() => handleDelete(a)} className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs font-bold text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={12} /> Supprimer
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setModalOpen(false)}
              className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-hidden pointer-events-auto flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
                  <h2 className="text-xl font-black text-brand-heading">{editing ? "Modifier l'adresse" : 'Ajouter une adresse'}</h2>
                  <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={18} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
                  <Field label="Libellé" value={form.label} onChange={v => setForm(p => ({ ...p, label: v }))} placeholder="Domicile, Bureau..." />
                  <Field label="Nom complet *" value={form.full_name} onChange={v => setForm(p => ({ ...p, full_name: v }))} required />
                  <Field label="Adresse ligne 1 *" value={form.address_line1} onChange={v => setForm(p => ({ ...p, address_line1: v }))} required />
                  <Field label="Adresse ligne 2" value={form.address_line2} onChange={v => setForm(p => ({ ...p, address_line2: v }))} />
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Ville *" value={form.city} onChange={v => setForm(p => ({ ...p, city: v }))} required />
                    <Field label="Région" value={form.state} onChange={v => setForm(p => ({ ...p, state: v }))} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Code postal *" value={form.postal_code} onChange={v => setForm(p => ({ ...p, postal_code: v }))} required />
                    <Field label="Pays *" value={form.country} onChange={v => setForm(p => ({ ...p, country: v }))} required />
                  </div>
                  <Field label="Téléphone *" value={form.phone} onChange={v => setForm(p => ({ ...p, phone: v }))} required />
                  <label className="flex items-center gap-2 text-sm cursor-pointer pt-2">
                    <input
                      type="checkbox"
                      checked={form.is_default}
                      onChange={e => setForm(p => ({ ...p, is_default: e.target.checked }))}
                      className="accent-brand-accent w-4 h-4"
                    />
                    Définir comme adresse par défaut
                  </label>
                  <div className="flex gap-3 pt-2">
                    <Button type="button" variant="outline" onClick={() => setModalOpen(false)} className="flex-1">Annuler</Button>
                    <Button type="submit" variant="primary" loading={saving} className="flex-1"><Save size={14} /> {editing ? 'Enregistrer' : 'Ajouter'}</Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function Field({ label, value, onChange, placeholder, required }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-brand-accent text-sm"
      />
    </div>
  );
}
