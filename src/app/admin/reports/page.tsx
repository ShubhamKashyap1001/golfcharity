'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { formatCurrency, getMonthName } from '@/lib/utils';

export default function AdminReportsPage() {
  const [drawStats, setDrawStats] = useState<any[]>([]);
  const [charityStats, setCharityStats] = useState<any[]>([]);
  const [subStats, setSubStats] = useState({ monthly: 0, yearly: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    Promise.all([
      supabase.from('draws').select('draw_month, draw_year, total_pool, jackpot_pool').eq('status', 'published').order('draw_year').order('draw_month'),
      supabase.from('charity_donations').select('amount, charity:charities(name)'),
      supabase.from('subscriptions').select('plan').eq('status', 'active'),
    ]).then(([draws, donations, subs]) => {
      // Draw chart data
      const drawData = (draws.data || []).map((d: any) => ({
        name: `${getMonthName(d.draw_month).slice(0, 3)} ${d.draw_year}`,
        pool: Number(d.total_pool),
        jackpot: Number(d.jackpot_pool),
      }));
      setDrawStats(drawData);

      // Charity aggregate
      const charityTotals: Record<string, number> = {};
      for (const d of donations.data || []) {
        const name = (d as any).charity?.name || 'Unknown';
        charityTotals[name] = (charityTotals[name] || 0) + Number(d.amount);
      }
      setCharityStats(Object.entries(charityTotals).map(([name, value]) => ({ name, value })));

      // Sub breakdown
      const monthlyCount = (subs.data || []).filter((s: any) => s.plan === 'monthly').length;
      const yearlyCount = (subs.data || []).filter((s: any) => s.plan === 'yearly').length;
      setSubStats({ monthly: monthlyCount, yearly: yearlyCount });

      setLoading(false);
    });
  }, []);

  const COLORS = ['#F5A623', '#FFD700', '#10B981', '#EF4444', '#6366F1', '#F97316'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      return (
        <div className="bg-dark-card border border-border rounded-lg p-3 shadow-card">
          <p className="text-xs text-gray-400 mb-1">{label}</p>
          {payload.map((p: any) => (
            <p key={p.name} className="text-sm font-medium" style={{ color: p.color }}>
              {p.name}: {formatCurrency(p.value * 100)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-8">
      <div className="page-header">
        <h1 className="page-title">Reports & Analytics</h1>
        <p className="page-subtitle">Platform-wide statistics and trends.</p>
      </div>

      {/* Subscription split */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Monthly Subscribers', value: subStats.monthly, color: 'text-gold-400' },
          { label: 'Yearly Subscribers', value: subStats.yearly, color: 'text-emerald-400' },
          { label: 'Total Active', value: subStats.monthly + subStats.yearly, color: 'text-white' },
        ].map(({ label, value, color }) => (
          <div key={label} className="stat-card">
            <p className={`font-display text-3xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Draw pool chart */}
      <div className="card">
        <h2 className="font-display text-xl font-semibold text-white mb-6">Draw Prize Pools Over Time</h2>
        {drawStats.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">No published draws yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={drawStats} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `£${v}`} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="pool" name="Total Pool" fill="#F5A623" radius={[4, 4, 0, 0]} opacity={0.8} />
              <Bar dataKey="jackpot" name="Jackpot" fill="#FFD700" radius={[4, 4, 0, 0]} opacity={0.6} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Charity donations pie */}
      <div className="card">
        <h2 className="font-display text-xl font-semibold text-white mb-6">Charity Donation Distribution</h2>
        {charityStats.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">No donations recorded yet.</p>
        ) : (
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <ResponsiveContainer width={220} height={220}>
              <PieChart>
                <Pie data={charityStats} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                  {charityStats.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value * 100)} contentStyle={{ background: '#1C1C1C', border: '1px solid #2A2A2A', borderRadius: '8px', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-3">
              {charityStats.map((c, i) => (
                <div key={c.name} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-sm text-gray-300 flex-1">{c.name}</span>
                  <span className="text-sm font-medium text-white">{formatCurrency(c.value * 100)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
