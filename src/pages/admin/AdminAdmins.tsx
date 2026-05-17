import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, X, Save, ShieldCheck, ShieldAlert, Mail, Lock, User as UserIcon, Eye, EyeOff } from 'lucide-react';
import { useAdmins, useCreateAdmin, useUpdateAdmin, useDeleteAdmin } from '../../hooks/useAdmins';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import toast from 'react-hot-toast';
import type { AdminAccount } from '../../types';

type FormState = {
  email: string;
  password: string;
  full_name: string;
  role: 'super_admin' | 'sub_admin';
};

const EMPTY_FORM: FormState = { email: '', password: '', full_name: '', role: 'sub_admin' };

export function AdminAdmins() {
  const { user, isSuperAdmin } = useAuthStore();
  const { data: admins, isLoading } = useAdmins();
  const createAdmin = useCreateAdmin();
  const updateAdmin = useUpdateAdmin();
  const deleteAdmin = useDeleteAdmin();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminAccount | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [showPassword, setShowPassword] = useState(false);

  if (!isSuperAdmin()) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center max-w-md mx-auto mt-12">
        <ShieldAlert size={36} className="mx-auto text-red-400 mb-4" />
        <h2 className="text-xl font-black text-brand-heading mb-2">Accès refusé</h2>
        <p className="text-sm text-gray-500">Seuls les super administrateurs peuvent accéder à cette page.</p>
      </div>
    );
  }

  const openNew = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowPassword(false);
    setModalOpen(true);
  };

  const openEdit = (a: AdminAccount) => {
    setEditing(a);
    setForm({
      email: a.email ?? '',
      password: '',
      full_name: a.full_name,
      role: (a.role === 'admin' ? 'super_admin' : a.role) as FormState['role'],
    });
    setShowPassword(false);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        const payload: any = { full_name: form.full_name.trim(), role: form.role };
        if (form.password) payload.password = form.password;
        await updateAdmin.mutateAsync({ id: editing.id, data: payload });
        toast.success('Administrateur mis à jour');
      } else {
        if (form.password.length < 8) {
          toast.error('Le mot de passe doit contenir au moins 8 caractères');
          return;
        }
        await createAdmin.mutateAsync({
          email: form.email.trim(),
          password: form.password,
          full_name: form.full_name.trim(),
          role: form.role,
        });
        toast.success('Administrateur créé');
      }
      setModalOpen(false);
    } catch (err: any) {
      toast.error(err.message ?? 'Échec de l\'enregistrement');
    }
  };

  const handleDelete = async (a: AdminAccount) => {
    if (a.id === user?.id) {
      toast.error('Vous ne pouvez pas supprimer votre propre compte.');
      return;
    }
    if (!confirm(`Supprimer définitivement l'administrateur « ${a.full_name} » ? Ses produits seront détachés.`)) return;
    try {
      await deleteAdmin.mutateAsync(a.id);
      toast.success('Administrateur supprimé');
    } catch (err: any) {
      toast.error(err.message ?? 'Échec de la suppression');
    }
  };

  const labelForRole = (r?: string) =>
    r === 'super_admin' || r === 'admin' ? 'Super administrateur' : 'Sous-administrateur';

  return (
    <>
      <Helmet><title>Administrateurs — SWIPO Admin</title></Helmet>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-black text-brand-heading">Administrateurs</h1>
            <p className="text-gray-400 text-sm mt-0.5">
              {admins?.length ?? 0} compte{(admins?.length ?? 0) > 1 ? 's' : ''} — gérez les super admins et sous-admins
            </p>
          </div>
          <Button variant="primary" onClick={openNew}>
            <Plus size={16} /> Nouvel administrateur
          </Button>
        </div>

        {/* Info banner */}
        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 flex gap-3">
          <ShieldCheck size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800 leading-relaxed">
            <p className="font-bold mb-1">Permissions</p>
            <p>
              <strong>Super administrateur</strong> : contrôle total — gestion des produits, commandes, clients, autres admins.
            </p>
            <p>
              <strong>Sous-administrateur</strong> : peut uniquement créer, modifier et supprimer ses propres produits.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}
          </div>
        ) : !admins?.length ? (
          <div className="bg-white rounded-3xl p-12 text-center">
            <ShieldCheck size={32} className="mx-auto text-gray-300 mb-3" />
            <p className="font-semibold text-gray-500">Aucun administrateur</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {admins.map((a, i) => {
              const isSelf = a.id === user?.id;
              const isSuper = a.role === 'super_admin' || a.role === 'admin';
              return (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-white rounded-2xl p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg shrink-0 ${
                      isSuper ? 'bg-brand-accent/10 text-brand-accent' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {a.full_name?.[0]?.toUpperCase() ?? '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-brand-heading truncate">{a.full_name}</p>
                        {isSelf && (
                          <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-bold rounded uppercase tracking-wider">
                            Vous
                          </span>
                        )}
                      </div>
                      {a.email && <p className="text-xs text-gray-400 truncate">{a.email}</p>}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full ${
                      isSuper ? 'bg-brand-accent/10 text-brand-accent' : 'bg-blue-50 text-blue-700'
                    }`}>
                      <ShieldCheck size={11} /> {labelForRole(a.role)}
                    </span>
                    <span className="text-xs text-gray-400 font-mono">
                      {a.product_count ?? 0} produit{(a.product_count ?? 0) > 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="flex gap-1 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => openEdit(a)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-brand-text hover:text-brand-accent hover:bg-gray-50 rounded-lg transition-all"
                    >
                      <Pencil size={12} /> Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(a)}
                      disabled={isSelf}
                      title={isSelf ? 'Vous ne pouvez pas vous supprimer vous-même' : ''}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-400"
                    >
                      <Trash2 size={12} /> Supprimer
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
              onClick={() => setModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={e => e.stopPropagation()}
            >
              <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                  <h2 className="text-xl font-black text-brand-heading">
                    {editing ? 'Modifier l\'administrateur' : 'Nouvel administrateur'}
                  </h2>
                  <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  {/* Email — read-only when editing */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                      Adresse e-mail *
                    </label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email" required={!editing}
                        disabled={!!editing}
                        value={form.email}
                        onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-brand-accent text-sm disabled:bg-gray-50 disabled:text-gray-500"
                        placeholder="admin@swipo.ma"
                      />
                    </div>
                    {editing && <p className="text-[11px] text-gray-400 mt-1">L'e-mail ne peut pas être modifié.</p>}
                  </div>

                  {/* Full name */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                      Nom complet *
                    </label>
                    <div className="relative">
                      <UserIcon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        required
                        value={form.full_name}
                        onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-brand-accent text-sm"
                        placeholder="ex. Karim Benali"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                      {editing ? 'Nouveau mot de passe (facultatif)' : 'Mot de passe *'}
                    </label>
                    <div className="relative">
                      <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required={!editing}
                        minLength={8}
                        value={form.password}
                        onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                        className="w-full pl-10 pr-12 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-brand-accent text-sm"
                        placeholder={editing ? 'Laissez vide pour ne pas changer' : 'Au moins 8 caractères'}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(s => !s)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-accent"
                      >
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  {/* Role */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Rôle *</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['sub_admin', 'super_admin'] as const).map(r => {
                        const active = form.role === r;
                        const disabled = editing && editing.id === user?.id && r !== 'super_admin';
                        return (
                          <button
                            key={r} type="button"
                            disabled={!!disabled}
                            onClick={() => setForm(p => ({ ...p, role: r }))}
                            className={`p-3 rounded-xl border-2 text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                              active
                                ? 'border-brand-accent bg-brand-accent/5'
                                : 'border-gray-100 hover:border-gray-200'
                            }`}
                          >
                            <p className="text-sm font-bold text-brand-heading">{labelForRole(r)}</p>
                            <p className="text-[11px] text-gray-400 mt-0.5">
                              {r === 'super_admin' ? 'Contrôle total' : 'Gestion produits uniquement'}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                    {editing && editing.id === user?.id && (
                      <p className="text-[11px] text-amber-600 mt-1.5">Vous ne pouvez pas changer votre propre rôle.</p>
                    )}
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button type="button" variant="outline" onClick={() => setModalOpen(false)} className="flex-1">Annuler</Button>
                    <Button type="submit" variant="primary" loading={createAdmin.isPending || updateAdmin.isPending} className="flex-1">
                      <Save size={14} /> {editing ? 'Enregistrer' : 'Créer'}
                    </Button>
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
