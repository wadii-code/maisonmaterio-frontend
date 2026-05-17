import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Search, User, Phone as PhoneIcon, Calendar, ShoppingBag, DollarSign } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Skeleton } from '../../components/ui/Skeleton';
import { Badge } from '../../components/ui/Badge';
import { formatPrice } from '../../lib/format';

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

async function fetchCustomers() {
  const { data: { session } } = await supabase.auth.getSession();
  const res = await fetch(`${BASE_URL}/customers`, {
    headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {},
  });
  if (!res.ok) throw new Error('Failed to fetch customers');
  return res.json();
}

export function AdminCustomers() {
  const [search, setSearch] = useState('');
  const { data: customers, isLoading } = useQuery({
    queryKey: ['admin-customers'],
    queryFn: fetchCustomers,
  });

  const filtered = (customers ?? []).filter((c: any) =>
    !search ||
    c.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.id?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Helmet><title>Clients — Maison Materiau Admin</title></Helmet>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-brand-heading">Clients</h1>
          <p className="text-gray-400 text-sm mt-0.5">{customers?.length ?? 0} clients au total</p>
        </div>

        <div className="bg-white rounded-2xl p-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text" placeholder="Rechercher par nom…"
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-accent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-44 rounded-2xl" />)
          ) : filtered.length === 0 ? (
            <div className="col-span-full bg-white rounded-2xl p-12 text-center text-gray-400">
              <User size={32} className="mx-auto mb-3 opacity-30" />
              <p className="font-semibold">Aucun client trouvé</p>
            </div>
          ) : filtered.map((c: any, i: number) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-white rounded-2xl p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-brand-accent/10 rounded-full flex items-center justify-center text-brand-accent font-black text-lg shrink-0">
                  {c.full_name?.[0]?.toUpperCase() ?? '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-brand-heading truncate">{c.full_name}</p>
                  <p className="text-xs text-gray-400 font-mono truncate">{c.id.slice(0, 8)}</p>
                </div>
                {(c.role === 'admin' || c.role === 'super_admin') && <Badge label="Super admin" color="orange" />}
                {c.role === 'sub_admin' && <Badge label="Sous-admin" color="orange" />}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-500">
                  <Calendar size={12} className="shrink-0" />
                  <span className="text-xs">Inscrit le {new Date(c.created_at).toLocaleDateString('fr-MA')}</span>
                </div>
                {c.phone && (
                  <div className="flex items-center gap-2 text-gray-500">
                    <PhoneIcon size={12} className="shrink-0" />
                    <span className="text-xs truncate">{c.phone}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-100">
                <div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <ShoppingBag size={11} /> Commandes
                  </div>
                  <p className="font-black text-brand-heading mt-0.5">{c.total_orders}</p>
                </div>
                <div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <DollarSign size={11} /> Total dépensé
                  </div>
                  <p className="font-black text-brand-accent mt-0.5">{formatPrice(c.total_spent ?? 0)}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </>
  );
}
