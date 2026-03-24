'use client';

import { useEffect, useState } from 'react';
import { Users, DollarSign, Heart, Trophy, TrendingUp, AlertTriangle } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';

interface Stats {
  totalUsers: number;
  activeSubscribers: number;
  totalPrizePool: number;
  totalCharityRaised: number;
  pendingVerifications: number;
  monthlyRevenue: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('draws').select('total_pool').eq('status', 'published'),
      supabase.from('charity_donations').select('amount'),
      supabase.from('winners').select('id', { count: 'exact', head: true }).eq('status', 'pending_verification'),
      supabase.from('subscriptions').select('amount_pence').eq('status', 'active'),
    ]).then(([users, subs, draws, donations, pending, activeSubs]) => {
      const totalPool = (draws.data || []).reduce((s: number, d: any) => s + Number(d.total_pool), 0);
      const totalDonations = (donations.data || []).reduce((s: number, d: any) => s + Number(d.amount), 0);
      const monthlyRev = (activeSubs.data || []).reduce((s: number, sub: any) => s + sub.amount_pence, 0);
      setStats({
        totalUsers: users.count || 0,
        activeSubscribers: subs.count || 0,
        totalPrizePool: totalPool,
        totalCharityRaised: totalDonations,
        pendingVerifications: pending.count || 0,
        monthlyRevenue: monthlyRev,
      });
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers.toString() || '0', icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Active Subscribers', value: stats?.activeSubscribers.toString() || '0', icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Total Prize Pool', value: formatCurrency((stats?.totalPrizePool || 0) * 100), icon: DollarSign, color: 'text-gold-400', bg: 'bg-gold-500/10' },
    { label: 'Charity Raised', value: formatCurrency((stats?.totalCharityRaised || 0) * 100), icon: Heart, color: 'text-ruby-400', bg: 'bg-ruby-500/10' },
    { label: 'Monthly Revenue', value: formatCurrency(stats?.monthlyRevenue || 0), icon: DollarSign, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Pending Verifications', value: stats?.pendingVerifications.toString() || '0', icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ];

  return (
    <div className="space-y-8">
      <div className="page-header">
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">Platform overview and key metrics.</p>
      </div>

      {stats?.pendingVerifications && stats.pendingVerifications > 0 ? (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-amber-500/30 bg-amber-500/5">
          <AlertTriangle size={18} className="text-amber-400 shrink-0" />
          <p className="text-sm text-amber-300">
            <strong>{stats.pendingVerifications}</strong> winner verification{stats.pendingVerifications !== 1 ? 's' : ''} awaiting review.{' '}
            <a href="/admin/winners" className="underline hover:text-amber-200">Review now →</a>
          </p>
        </div>
      ) : null}

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="stat-card">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon size={18} className={color} />
            </div>
            <p className={`font-display text-3xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="card">
        <h2 className="font-display text-xl font-semibold text-white mb-5">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: '/admin/draws', label: 'Manage Draws', icon: Trophy, color: 'text-gold-400' },
            { href: '/admin/winners', label: 'Verify Winners', icon: AlertTriangle, color: 'text-amber-400' },
            { href: '/admin/charities', label: 'Edit Charities', icon: Heart, color: 'text-ruby-400' },
            { href: '/admin/users', label: 'View Users', icon: Users, color: 'text-blue-400' },
          ].map(({ href, label, icon: Icon, color }) => (
            <a key={href} href={href} className="card-hover flex flex-col items-center gap-2 p-4 text-center cursor-pointer">
              <Icon size={22} className={color} />
              <span className="text-sm text-gray-300">{label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
