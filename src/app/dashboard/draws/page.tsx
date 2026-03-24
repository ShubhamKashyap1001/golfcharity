'use client';

import { useEffect, useState } from 'react';
import { Ticket, Trophy } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { formatCurrency, getMonthName, getStatusBadge, checkMatches, cn } from '@/lib/utils';
import type { Draw, DrawEntry, Winner } from '@/types';

interface DrawWithEntry extends Draw {
  entry?: DrawEntry;
  winner?: Winner;
}

export default function DrawsPage() {
  const { user } = useAuthStore();
  const [draws, setDraws] = useState<DrawWithEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const supabase = createSupabaseBrowserClient();
    Promise.all([
      supabase.from('draws').select('*').eq('status', 'published').order('draw_year', { ascending: false }).order('draw_month', { ascending: false }),
      supabase.from('draw_entries').select('*').eq('user_id', user.id),
      supabase.from('winners').select('*').eq('user_id', user.id),
    ]).then(([d, e, w]) => {
      const entries = (e.data as DrawEntry[]) || [];
      const winners = (w.data as Winner[]) || [];
      const merged = ((d.data as Draw[]) || []).map(draw => ({
        ...draw,
        entry: entries.find(en => en.draw_id === draw.id),
        winner: winners.find(wn => wn.draw_id === draw.id),
      }));
      setDraws(merged);
      setLoading(false);
    });
  }, [user]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="page-header">
        <h1 className="page-title">Draw History</h1>
        <p className="page-subtitle">All published draws and your participation results.</p>
      </div>

      {draws.length === 0 ? (
        <div className="card text-center py-16">
          <Ticket size={40} className="text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No draws published yet. Check back soon!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {draws.map(draw => {
            const matchCount = draw.entry ? checkMatches(draw.entry.entry_numbers, draw.winning_numbers) : 0;
            const isWinner = matchCount >= 3;
            return (
              <div key={draw.id} className={cn('card', isWinner && 'border-gold-500/40 bg-gold-500/5')}>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Draw info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="font-display text-xl font-semibold text-white">
                        {getMonthName(draw.draw_month)} {draw.draw_year} Draw
                      </h3>
                      {isWinner && draw.winner && (
                        <span className={cn('badge', getStatusBadge(draw.winner.status))}>
                          {draw.winner.status.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                    {/* Winning numbers */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs text-gray-500 mr-1">Winning:</span>
                      {draw.winning_numbers.map((n, i) => {
                        const matched = draw.entry?.entry_numbers.includes(n);
                        return (
                          <div key={i} className={cn(
                            'w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold font-display',
                            matched ? 'bg-gold-gradient text-black shadow-gold' : 'bg-dark border border-border text-gray-400'
                          )}>
                            {n}
                          </div>
                        );
                      })}
                    </div>
                    {/* Entry numbers */}
                    {draw.entry && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 mr-1">Your entry:</span>
                        {draw.entry.entry_numbers.map((n, i) => (
                          <div key={i} className={cn(
                            'w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold font-display border',
                            draw.winning_numbers.includes(n) ? 'border-gold-500/60 text-gold-400 bg-gold-500/10' : 'border-border text-gray-600'
                          )}>
                            {n}
                          </div>
                        ))}
                        <span className="text-xs text-gray-500 ml-1">
                          {matchCount} match{matchCount !== 1 ? 'es' : ''}
                        </span>
                      </div>
                    )}
                    {!draw.entry && (
                      <p className="text-xs text-gray-600">You were not entered in this draw</p>
                    )}
                  </div>
                  {/* Prize info */}
                  <div className="sm:text-right shrink-0">
                    <p className="text-xs text-gray-500 mb-1">Jackpot</p>
                    <p className="font-display text-2xl text-gold-400 font-bold">{formatCurrency(draw.jackpot_pool * 100)}</p>
                    <p className="text-xs text-gray-500 mt-1">Total Pool: {formatCurrency(draw.total_pool * 100)}</p>
                    {isWinner && draw.winner && (
                      <div className="mt-2 p-2 rounded-lg bg-gold-500/10 border border-gold-500/20">
                        <div className="flex items-center gap-1.5 justify-end">
                          <Trophy size={13} className="text-gold-400" />
                          <span className="text-sm font-bold text-gold-400">{formatCurrency(draw.winner.prize_amount * 100)}</span>
                        </div>
                        <p className="text-xs text-gray-500">{draw.winner.match_type.replace('_', ' ')}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
