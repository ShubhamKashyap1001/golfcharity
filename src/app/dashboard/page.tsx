'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Trophy, Target, Heart, Ticket, ArrowRight, AlertCircle, CheckCircle, Shield } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { formatCurrency, formatDate, getMonthName, getStatusBadge, cn } from '@/lib/utils';
import type { GolfScore, UserCharity, Winner, Draw } from '@/types';

export default function DashboardPage() {
  const { user, subscription } = useAuthStore();
  const [scores, setScores] = useState<GolfScore[]>([]);
  const [charity, setCharity] = useState<UserCharity | null>(null);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [upcomingDraw, setUpcomingDraw] = useState<Draw | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const supabase = createSupabaseBrowserClient();
    Promise.all([
      supabase.from('golf_scores').select('*').eq('user_id', user.id).order('score_date', { ascending: false }).limit(5),
      supabase.from('user_charities').select('*, charity:charities(*)').eq('user_id', user.id).eq('is_active', true).maybeSingle(),
      supabase.from('winners').select('*, draw:draws(*)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
      supabase.from('draws').select('*').in('status', ['pending', 'simulated']).order('draw_year', { ascending: false }).order('draw_month', { ascending: false }).limit(1).maybeSingle(),
    ]).then(([s, c, w, d]) => {
      setScores((s.data as GolfScore[]) || []);
      setCharity(c.data as UserCharity | null);
      setWinners((w.data as Winner[]) || []);
      setUpcomingDraw(d.data as Draw | null);
      setLoading(false);
    });
  }, [user]);

  const totalWon = winners.filter(w => w.status === 'paid').reduce((sum, w) => sum + w.prize_amount, 0);
  const isAdmin = user?.role === 'admin';
  const isActive = subscription?.status === 'active';
  const hasSubscription = !!subscription;

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="page-header">
        <h1 className="page-title">Welcome back, {user?.full_name.split(' ')[0]} 👋</h1>
        <p className="page-subtitle">Here's your overview for this month.</p>
      </div>

      {/* Admin banner */}
      {isAdmin && (
        <div className="flex items-center gap-4 p-5 rounded-xl border border-gold-500/30 bg-gold-500/5">
          <Shield size={20} className="text-gold-400 shrink-0" />
          <div className="flex-1">
            <p className="font-medium text-white text-sm">You are logged in as Administrator</p>
            <p className="text-gray-400 text-sm mt-0.5">Admins do not require a subscription. Use the Admin Panel to manage the platform.</p>
          </div>
          <Link href="/admin" className="btn-gold text-sm py-2 shrink-0">Admin Panel →</Link>
        </div>
      )}

      {/* Subscription status banner — subscribers only */}
      {!isAdmin && (
        <div className={cn(
          'flex items-start gap-4 p-5 rounded-xl border',
          isActive ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-amber-500/30 bg-amber-500/5'
        )}>
          {isActive
            ? <CheckCircle size={20} className="text-emerald-400 shrink-0 mt-0.5" />
            : <AlertCircle size={20} className="text-amber-400 shrink-0 mt-0.5" />}
          <div className="flex-1">
            {isActive ? (
              <>
                <p className="font-medium text-white text-sm">
                  Subscription Active — <span className="text-emerald-400 capitalize">{subscription?.plan} Plan</span>
                </p>
                <p className="text-gray-400 text-sm mt-0.5">
                  {subscription?.current_period_end ? `Renews on ${formatDate(subscription.current_period_end)}` : 'Your subscription is active'}
                </p>
              </>
            ) : (
              <>
                <p className="font-medium text-white text-sm">
                  {hasSubscription ? `Subscription ${subscription?.status}` : 'No active subscription'}
                </p>
                <p className="text-gray-400 text-sm mt-0.5">Subscribe to enter draws and support charities.</p>
              </>
            )}
          </div>
          {!isActive && (
            <Link href="/dashboard/subscription" className="btn-gold text-sm py-2 shrink-0">
              {hasSubscription ? 'Renew' : 'Subscribe Now'}
            </Link>
          )}
          {isActive && (
            <Link href="/dashboard/subscription" className="btn-outline text-sm py-2 shrink-0">Manage</Link>
          )}
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Won', value: formatCurrency(totalWon * 100), icon: Trophy, color: 'text-gold-400', sub: `${winners.filter(w => w.status === 'paid').length} prizes` },
          { label: 'Scores Logged', value: scores.length.toString(), icon: Target, color: 'text-emerald-400', sub: 'of 5 max' },
          { label: 'Charity Impact', value: charity ? `${charity.donation_percentage}%` : '—', icon: Heart, color: 'text-ruby-400', sub: charity?.charity?.name || 'None selected' },
          { label: 'Next Draw', value: upcomingDraw ? `${getMonthName(upcomingDraw.draw_month)}` : 'TBA', icon: Ticket, color: 'text-blue-400', sub: upcomingDraw ? String(upcomingDraw.draw_year) : 'No draw scheduled' },
        ].map(({ label, value, icon: Icon, color, sub }) => (
          <div key={label} className="stat-card">
            <Icon size={18} className={`${color} mb-2`} />
            <p className="font-display text-2xl font-semibold text-white">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            <p className="text-xs text-gray-600 truncate">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Scores */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-xl font-semibold text-white">My Scores</h2>
            <Link href="/dashboard/scores" className="text-sm text-gold-400 hover:text-gold-300 flex items-center gap-1">
              Manage <ArrowRight size={13} />
            </Link>
          </div>
          {scores.length === 0 ? (
            <div className="text-center py-10">
              <Target size={32} className="text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No scores logged yet</p>
              <Link href="/dashboard/scores" className="btn-gold text-sm mt-4 inline-flex">Add Your First Score</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {scores.map((score, i) => (
                <div key={score.id} className="score-bar">
                  <div className="w-8 h-8 rounded-lg bg-gold-500/10 flex items-center justify-center text-gold-400 font-bold text-sm font-display">
                    {score.score}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white font-medium">Stableford Score</p>
                    <p className="text-xs text-gray-500">{formatDate(score.score_date)}</p>
                  </div>
                  {i === 0 && <span className="text-xs text-gold-400 font-medium">Latest</span>}
                </div>
              ))}
              <p className="text-xs text-gray-600 text-center pt-2">
                {scores.length}/5 scores stored • Oldest auto-removed on 6th entry
              </p>
            </div>
          )}
        </div>

        {/* Charity & Draw */}
        <div className="space-y-4">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-semibold text-white">My Charity</h2>
              <Link href="/dashboard/charity" className="text-sm text-gold-400 hover:text-gold-300 flex items-center gap-1">
                {charity ? 'Change' : 'Choose'} <ArrowRight size={13} />
              </Link>
            </div>
            {charity ? (
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-400 font-bold font-display text-xl">
                  {charity.charity?.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-white">{charity.charity?.name}</p>
                  <p className="text-sm text-gray-400">{charity.donation_percentage}% of subscription donated</p>
                </div>
                <Heart size={18} className="text-gold-400 fill-gold-400/30" />
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-400 text-sm mb-3">No charity selected yet</p>
                <Link href="/dashboard/charity" className="btn-gold text-sm inline-flex">Choose a Charity</Link>
              </div>
            )}
          </div>

          <div className="card border-gold-500/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-semibold text-white">Upcoming Draw</h2>
              <Link href="/dashboard/draws" className="text-sm text-gold-400 hover:text-gold-300 flex items-center gap-1">
                History <ArrowRight size={13} />
              </Link>
            </div>
            {upcomingDraw ? (
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">{getMonthName(upcomingDraw.draw_month)} {upcomingDraw.draw_year}</p>
                    <p className="font-display text-2xl text-gold-400 font-bold mt-1">
                      {formatCurrency(upcomingDraw.jackpot_pool * 100)} Jackpot
                    </p>
                  </div>
                  <span className={cn('badge', getStatusBadge(upcomingDraw.status))}>{upcomingDraw.status}</span>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  {scores.length > 0 ? '✓ Your scores are entered for this draw' : '⚠ Log scores to enter this draw'}
                </p>
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No upcoming draw scheduled yet.</p>
            )}
          </div>
        </div>
      </div>

      {winners.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-xl font-semibold text-white">Recent Winnings</h2>
            <Link href="/dashboard/winnings" className="text-sm text-gold-400 hover:text-gold-300 flex items-center gap-1">
              View All <ArrowRight size={13} />
            </Link>
          </div>
          <div className="space-y-3">
            {winners.slice(0, 3).map(w => (
              <div key={w.id} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-dark hover:border-border-light transition-colors">
                <Trophy size={18} className="text-gold-400 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">
                    {w.draw ? `${getMonthName(w.draw.draw_month)} ${w.draw.draw_year} Draw` : 'Prize Draw'}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">{w.match_type.replace('_', ' ')}</p>
                </div>
                <div className="text-right">
                  <p className="font-display text-lg text-gold-400 font-bold">{formatCurrency(w.prize_amount * 100)}</p>
                  <span className={cn('badge text-xs', getStatusBadge(w.status))}>{w.status.replace('_', ' ')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}