import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Skeleton } from '../ui/Skeleton';

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

async function fetchRevenue(period: string) {
  const { data: { session } } = await supabase.auth.getSession();
  const res = await fetch(`${BASE_URL}/customers/revenue?period=${period}`, {
    headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {},
  });
  if (!res.ok) throw new Error('Failed to fetch revenue');
  return res.json() as Promise<{ series: { date: string; revenue: number }[]; total: number }>;
}

export function RevenueChart() {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('7d');
  const { data, isLoading } = useQuery({
    queryKey: ['revenue', period],
    queryFn: () => fetchRevenue(period),
    refetchInterval: 60_000,
  });

  const series = data?.series ?? [];
  const max = Math.max(...series.map(p => p.revenue), 1);

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
        <div>
          <h2 className="font-black text-brand-heading flex items-center gap-2">
            <TrendingUp size={18} className="text-brand-accent" /> Revenue Overview
          </h2>
          {data && <p className="text-xs text-gray-400 mt-0.5">Total: <span className="font-black text-brand-heading">${data.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></p>}
        </div>
        <div className="flex bg-gray-100 p-1 rounded-full">
          {(['7d', '30d', '90d'] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all ${
                period === p ? 'bg-white text-brand-heading shadow-sm' : 'text-gray-400'
              }`}
            >
              {p === '7d' ? '7 days' : p === '30d' ? '30 days' : '90 days'}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {isLoading ? (
          <Skeleton className="h-48 w-full" />
        ) : series.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No data available</div>
        ) : (
          <div className="relative h-48 flex items-end gap-1.5">
            {series.map((point, i) => {
              const heightPercent = (point.revenue / max) * 100;
              return (
                <motion.div
                  key={point.date}
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(heightPercent, 1)}%` }}
                  transition={{ duration: 0.5, delay: i * 0.02, ease: 'easeOut' }}
                  className="flex-1 group relative"
                >
                  <div
                    className={`w-full rounded-t-md transition-colors h-full ${
                      point.revenue > 0
                        ? 'bg-gradient-to-t from-brand-accent to-brand-orange hover:from-brand-orange hover:to-brand-accent'
                        : 'bg-gray-100'
                    }`}
                    title={`${point.date}: $${point.revenue.toFixed(2)}`}
                  />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-brand-dark text-white text-xs font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                    ${point.revenue.toFixed(2)}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
        {series.length > 0 && period !== '90d' && (
          <div className="flex justify-between mt-2 text-[10px] text-gray-400 font-mono">
            <span>{series[0]?.date}</span>
            <span>{series[series.length - 1]?.date}</span>
          </div>
        )}
      </div>
    </div>
  );
}
