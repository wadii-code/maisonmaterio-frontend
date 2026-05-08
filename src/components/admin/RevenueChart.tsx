import { useState, useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Skeleton } from '../ui/Skeleton';
import { formatPrice } from '../../lib/format';

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

async function fetchRevenue(period: string) {
  const { data: { session } } = await supabase.auth.getSession();
  const res = await fetch(`${BASE_URL}/customers/revenue?period=${period}`, {
    headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {},
  });
  if (!res.ok) throw new Error('Failed to fetch revenue');
  return res.json() as Promise<{ series: { date: string; revenue: number }[]; total: number }>;
}

// Build a smooth Catmull-Rom-style cubic Bezier path through the points.
function smoothPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const tension = 0.18;
    const cp1x = p1.x + (p2.x - p0.x) * tension;
    const cp1y = p1.y + (p2.y - p0.y) * tension;
    const cp2x = p2.x - (p3.x - p1.x) * tension;
    const cp2y = p2.y - (p3.y - p1.y) * tension;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

const W = 800;
const H = 220;
const PAD_X = 16;
const PAD_TOP = 14;
const PAD_BOTTOM = 22;

export function RevenueChart() {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('7d');
  const [hover, setHover] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['revenue', period],
    queryFn: () => fetchRevenue(period),
    refetchInterval: 60_000,
  });

  const series = data?.series ?? [];
  const hasAnyRevenue = series.some(p => p.revenue > 0);

  const { points, linePath, areaPath, max, yTicks } = useMemo(() => {
    if (series.length === 0 || !hasAnyRevenue) {
      return { points: [], linePath: '', areaPath: '', max: 0, yTicks: [] as number[] };
    }
    const rawMax = Math.max(...series.map(p => p.revenue), 0);
    // Round max up to a "nice" value so the y-axis labels look clean
    const niceMax = niceCeil(rawMax || 100);
    const innerW = W - PAD_X * 2;
    const innerH = H - PAD_TOP - PAD_BOTTOM;
    const stepX = series.length > 1 ? innerW / (series.length - 1) : 0;
    const pts = series.map((p, i) => ({
      x: PAD_X + i * stepX,
      y: PAD_TOP + innerH - (p.revenue / niceMax) * innerH,
      raw: p,
    }));
    const line = smoothPath(pts);
    const area = pts.length
      ? `${line} L ${pts[pts.length - 1].x} ${PAD_TOP + innerH} L ${pts[0].x} ${PAD_TOP + innerH} Z`
      : '';
    const ticks = [0, niceMax / 2, niceMax];
    return { points: pts, linePath: line, areaPath: area, max: niceMax, yTicks: ticks };
  }, [series, hasAnyRevenue]);

  const handleMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (points.length === 0 || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * W;
    let bestIdx = 0;
    let bestDist = Infinity;
    points.forEach((p, i) => {
      const d = Math.abs(p.x - x);
      if (d < bestDist) { bestDist = d; bestIdx = i; }
    });
    setHover(bestIdx);
  };

  const hoverPoint = hover !== null ? points[hover] : null;

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
        <div>
          <h2 className="font-black text-brand-heading flex items-center gap-2">
            <TrendingUp size={18} className="text-brand-accent" /> Revenue Overview
          </h2>
          {data && (
            <p className="text-xs text-gray-400 mt-0.5">
              Total: <span className="font-black text-brand-heading">{formatPrice(data.total)}</span>
            </p>
          )}
        </div>
        <div className="flex bg-gray-100 p-1 rounded-full">
          {(['7d', '30d', '90d'] as const).map(p => (
            <button key={p} onClick={() => { setPeriod(p); setHover(null); }}
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
          <Skeleton className="h-56 w-full" />
        ) : series.length === 0 || !hasAnyRevenue ? (
          <div className="h-56 flex flex-col items-center justify-center text-gray-400 text-sm gap-1.5">
            <TrendingUp size={28} className="opacity-30" />
            <p className="font-semibold">No revenue yet for this period</p>
            <p className="text-xs">Mark an order as <span className="font-bold text-purple-500">shipped</span> or <span className="font-bold text-emerald-500">delivered</span> to see the curve.</p>
          </div>
        ) : (
          <div className="relative">
            <svg
              ref={svgRef}
              viewBox={`0 0 ${W} ${H}`}
              preserveAspectRatio="none"
              className="w-full h-56 select-none"
              onMouseMove={handleMove}
              onMouseLeave={() => setHover(null)}
            >
              <defs>
                <linearGradient id="rev-area" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#f5a623" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#f5a623" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="rev-line" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0%" stopColor="#f5a623" />
                  <stop offset="100%" stopColor="#ff6b35" />
                </linearGradient>
              </defs>

              {/* Y gridlines + labels */}
              {yTicks.map((t, i) => {
                const y = PAD_TOP + (H - PAD_TOP - PAD_BOTTOM) * (1 - t / max);
                return (
                  <g key={i}>
                    <line x1={PAD_X} x2={W - PAD_X} y1={y} y2={y}
                      stroke="#f3f4f6" strokeWidth={1} strokeDasharray={i === 0 ? '0' : '3 4'} />
                    <text x={W - PAD_X} y={y - 4} textAnchor="end"
                      className="fill-gray-300" fontSize={10} fontFamily="ui-monospace, monospace">
                      {compact(t)}
                    </text>
                  </g>
                );
              })}

              {/* Area fill */}
              <motion.path
                d={areaPath}
                fill="url(#rev-area)"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
              />

              {/* Line */}
              <motion.path
                d={linePath}
                fill="none"
                stroke="url(#rev-line)"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
              />

              {/* Hover marker */}
              {hoverPoint && (
                <g>
                  <line x1={hoverPoint.x} x2={hoverPoint.x}
                    y1={PAD_TOP} y2={H - PAD_BOTTOM}
                    stroke="#1a1a1a" strokeOpacity={0.12} strokeWidth={1} />
                  <circle cx={hoverPoint.x} cy={hoverPoint.y} r={6}
                    fill="white" stroke="#f5a623" strokeWidth={2.5} />
                </g>
              )}

              {/* Data dots — small, only show when fewer than ~14 points */}
              {points.length <= 14 && points.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r={2.5}
                  fill="#f5a623" stroke="white" strokeWidth={1.5} />
              ))}
            </svg>

            {/* Hover tooltip */}
            {hoverPoint && (
              <div
                className="absolute pointer-events-none px-3 py-2 bg-brand-dark text-white rounded-lg text-xs font-bold shadow-lg whitespace-nowrap"
                style={{
                  left: `calc(${(hoverPoint.x / W) * 100}% )`,
                  top: `calc(${(hoverPoint.y / H) * 100}% - 56px)`,
                  transform: 'translateX(-50%)',
                }}
              >
                <p className="text-[10px] opacity-60 font-mono">{hoverPoint.raw.date}</p>
                <p className="text-sm font-black">{formatPrice(hoverPoint.raw.revenue)}</p>
              </div>
            )}
          </div>
        )}

        {/* X-axis date labels */}
        {series.length > 0 && (
          <div className="flex justify-between mt-2 text-[10px] text-gray-400 font-mono px-4">
            <span>{series[0]?.date}</span>
            {period !== '7d' && series.length > 2 && (
              <span>{series[Math.floor(series.length / 2)]?.date}</span>
            )}
            <span>{series[series.length - 1]?.date}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function niceCeil(n: number): number {
  if (n <= 0) return 0;
  const exp = Math.pow(10, Math.floor(Math.log10(n)));
  const f = n / exp;
  let nice;
  if (f <= 1) nice = 1;
  else if (f <= 2) nice = 2;
  else if (f <= 5) nice = 5;
  else nice = 10;
  return nice * exp;
}

function compact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}k`;
  return String(Math.round(n));
}
