'use client';
import Link from 'next/link';
import { formatCurrency, getMonthName } from '@/lib/utils';
import type { Draw } from '@/types';

export function DrawSection({ draw }: { draw: Draw | null }) {
  const numbers = draw?.winning_numbers || [12, 24, 7, 33, 18];
  const jackpot = draw?.jackpot_pool || 8000;

  return (
    <section id="draws" className="section bg-black">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div>
            <span className="text-gold-400 text-sm font-medium uppercase tracking-widest">Monthly Prize Draw</span>
            <h2 className="font-display text-5xl md:text-6xl font-semibold text-white mt-3 mb-5">Your Scores Are Your Lottery Numbers</h2>
            <p className="text-gray-400 text-lg mb-8 leading-relaxed">Every time you log a Stableford score, you're building your entry into the next monthly draw. Match 3, 4, or all 5 numbers — and win.</p>
            <div className="space-y-4 mb-8">
              {[
                { match: '5 Numbers', label: 'JACKPOT', pct: '40% of pool', color: 'text-gold-400' },
                { match: '4 Numbers', label: 'SILVER', pct: '35% of pool', color: 'text-gray-300' },
                { match: '3 Numbers', label: 'BRONZE', pct: '25% of pool', color: 'text-amber-600' },
              ].map(t => (
                <div key={t.match} className="flex items-center justify-between p-4 rounded-xl border border-border bg-dark-card">
                  <div className="flex items-center gap-3">
                    <span className={`font-display text-2xl font-bold ${t.color}`}>{t.match}</span>
                    <span className="text-xs font-medium text-black px-2 py-0.5 rounded bg-gold-500/80">{t.label}</span>
                  </div>
                  <span className="text-sm text-gray-400">{t.pct}</span>
                </div>
              ))}
            </div>
            <Link href="/auth/register" className="btn-gold">Enter Next Draw</Link>
          </div>
          {/* Right — Draw card */}
          <div className="relative">
            <div className="absolute inset-0 bg-gold-500/5 rounded-3xl blur-3xl" />
            <div className="relative card border-gold-500/20 bg-dark-card p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">
                    {draw ? `${getMonthName(draw.draw_month)} ${draw.draw_year}` : 'Latest'} Draw
                  </p>
                  <p className="font-display text-2xl font-semibold text-white mt-1">Winning Numbers</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Jackpot</p>
                  <p className="font-display text-2xl text-gold-400 font-bold">{formatCurrency(jackpot * 100)}</p>
                </div>
              </div>
              {/* Numbers */}
              <div className="flex gap-3 justify-center mb-8">
                {numbers.map((n, i) => (
                  <div key={i} className="draw-ball animate-draw-reveal" style={{ animationDelay: `${i * 0.15}s` }}>{n}</div>
                ))}
              </div>
              {/* Pool breakdown */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Total Pool', value: draw?.total_pool || 12000 },
                  { label: '4-Match Pool', value: draw?.four_match_pool || 4200 },
                  { label: '3-Match Pool', value: draw?.three_match_pool || 3000 },
                ].map(({ label, value }) => (
                  <div key={label} className="text-center p-3 rounded-lg bg-black/40">
                    <p className="text-xs text-gray-500 mb-1">{label}</p>
                    <p className="font-display text-lg text-white font-semibold">{formatCurrency(value * 100)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
