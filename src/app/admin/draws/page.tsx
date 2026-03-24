'use client';

import { useEffect, useState } from 'react';
import { Plus, Play, CheckCircle, Shuffle, BarChart2 } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { formatCurrency, getMonthName, getStatusBadge, runDrawLogic, cn } from '@/lib/utils';
import type { Draw, DrawEntry } from '@/types';
import toast from 'react-hot-toast';

export default function AdminDrawsPage() {
  const [draws, setDraws] = useState<Draw[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear(), logic: 'random' as 'random' | 'algorithmic' });
  const [saving, setSaving] = useState<string | null>(null);

  const supabase = createSupabaseBrowserClient();

  const fetchDraws = async () => {
    const { data } = await supabase.from('draws').select('*').order('draw_year', { ascending: false }).order('draw_month', { ascending: false });
    setDraws((data as Draw[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchDraws(); }, []);

  const handleCreate = async () => {
    setSaving('create');
    const { error } = await supabase.from('draws').insert({
      draw_month: form.month,
      draw_year: form.year,
      logic: form.logic,
      winning_numbers: [],
      status: 'pending',
    });
    if (error) toast.error(error.message);
    else { toast.success('Draw created'); setCreating(false); fetchDraws(); }
    setSaving(null);
  };

  const handleSimulate = async (draw: Draw) => {
    setSaving(draw.id);
    // Get all entry numbers for algorithmic logic
    let allEntries: number[][] = [];
    if (draw.logic === 'algorithmic') {
      const { data } = await supabase.from('draw_entries').select('entry_numbers').eq('draw_id', draw.id);
      allEntries = ((data as DrawEntry[]) || []).map(e => e.entry_numbers);
    }
    const numbers = runDrawLogic(draw.logic, allEntries);
    const { error } = await supabase.from('draws').update({ simulated_numbers: numbers, status: 'simulated' }).eq('id', draw.id);
    if (error) toast.error(error.message);
    else { toast.success(`Simulation: [${numbers.join(', ')}]`); fetchDraws(); }
    setSaving(null);
  };

  const handlePublish = async (draw: Draw) => {
    if (!confirm(`Publish this draw with numbers [${draw.simulated_numbers?.join(', ')}]? This will process winners and cannot be undone.`)) return;
    setSaving(draw.id);

    // Calculate prize pool from active subscriptions
    const { data: subs } = await supabase.from('subscriptions').select('amount_pence').eq('status', 'active');
    const totalRevPence = (subs || []).reduce((s: number, sub: any) => s + sub.amount_pence, 0);
    const prizePool = totalRevPence * 0.006; // 0.6% per pence → £
    const jackpotPool = prizePool * 0.4 + draw.jackpot_rollover;
    const fourPool = prizePool * 0.35;
    const threePool = prizePool * 0.25;

    const winNums = draw.simulated_numbers || runDrawLogic(draw.logic);

    // Update draw to published
    const { error: drawErr } = await supabase.from('draws').update({
      status: 'published',
      winning_numbers: winNums,
      total_pool: prizePool,
      jackpot_pool: jackpotPool,
      four_match_pool: fourPool,
      three_match_pool: threePool,
      published_at: new Date().toISOString(),
    }).eq('id', draw.id);

    if (drawErr) { toast.error(drawErr.message); setSaving(null); return; }

    // Process entries → find winners
    const { data: entries } = await supabase.from('draw_entries').select('*').eq('draw_id', draw.id);
    const winners3: string[] = [], winners4: string[] = [], winners5: string[] = [];

    for (const entry of (entries as DrawEntry[]) || []) {
      const matches = entry.entry_numbers.filter((n: number) => winNums.includes(n)).length;
      if (matches === 5) winners5.push(entry.user_id);
      else if (matches === 4) winners4.push(entry.user_id);
      else if (matches === 3) winners3.push(entry.user_id);
    }

    // Insert winner records
    const winnerInserts: any[] = [];
    const getMatchedNums = (entry: DrawEntry) => entry.entry_numbers.filter((n: number) => winNums.includes(n));

    for (const userId of winners5) {
      const entry = (entries as DrawEntry[]).find(e => e.user_id === userId)!;
      winnerInserts.push({ draw_id: draw.id, user_id: userId, match_type: 'five_match', matched_numbers: getMatchedNums(entry), prize_amount: winners5.length ? jackpotPool / winners5.length : 0 });
    }
    for (const userId of winners4) {
      const entry = (entries as DrawEntry[]).find(e => e.user_id === userId)!;
      winnerInserts.push({ draw_id: draw.id, user_id: userId, match_type: 'four_match', matched_numbers: getMatchedNums(entry), prize_amount: winners4.length ? fourPool / winners4.length : 0 });
    }
    for (const userId of winners3) {
      const entry = (entries as DrawEntry[]).find(e => e.user_id === userId)!;
      winnerInserts.push({ draw_id: draw.id, user_id: userId, match_type: 'three_match', matched_numbers: getMatchedNums(entry), prize_amount: winners3.length ? threePool / winners3.length : 0 });
    }

    if (winnerInserts.length > 0) {
      await supabase.from('winners').insert(winnerInserts);
    }

    // Jackpot rollover if no 5-match
    if (winners5.length === 0) {
      await supabase.from('draws').update({ jackpot_rollover: jackpotPool }).eq('id', draw.id);
    }

    toast.success(`Draw published! ${winnerInserts.length} winner(s) found.`);
    fetchDraws();
    setSaving(null);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between page-header">
        <div>
          <h1 className="page-title">Draw Management</h1>
          <p className="page-subtitle">Create, simulate, and publish monthly prize draws.</p>
        </div>
        <button onClick={() => setCreating(!creating)} className="btn-gold"><Plus size={16} /> New Draw</button>
      </div>

      {/* Create form */}
      {creating && (
        <div className="card border-gold-500/30">
          <h3 className="font-display text-lg font-semibold text-white mb-5">Create New Draw</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Month</label>
              <select className="input" value={form.month} onChange={e => setForm(f => ({ ...f, month: parseInt(e.target.value) }))}>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>{getMonthName(i + 1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Year</label>
              <input type="number" className="input" value={form.year} onChange={e => setForm(f => ({ ...f, year: parseInt(e.target.value) }))} />
            </div>
            <div>
              <label className="label">Draw Logic</label>
              <select className="input" value={form.logic} onChange={e => setForm(f => ({ ...f, logic: e.target.value as any }))}>
                <option value="random">Random</option>
                <option value="algorithmic">Algorithmic (score-weighted)</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={handleCreate} disabled={saving === 'create'} className="btn-gold">
              {saving === 'create' ? 'Creating…' : <><Plus size={15} /> Create Draw</>}
            </button>
            <button onClick={() => setCreating(false)} className="btn-outline">Cancel</button>
          </div>
        </div>
      )}

      {/* Draws list */}
      <div className="space-y-4">
        {draws.map(draw => (
          <div key={draw.id} className="card">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-display text-xl font-semibold text-white">
                    {getMonthName(draw.draw_month)} {draw.draw_year}
                  </h3>
                  <span className={cn('badge', getStatusBadge(draw.status))}>{draw.status}</span>
                  <span className="badge bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs capitalize">{draw.logic}</span>
                </div>

                {/* Numbers display */}
                {(draw.winning_numbers?.length > 0 || (draw.simulated_numbers?.length || 0) > 0) && (
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs text-gray-500">
                      {draw.status === 'published' ? 'Winning:' : 'Simulated:'}
                    </span>
                    {(draw.status === 'published' ? draw.winning_numbers : draw.simulated_numbers || []).map((n, i) => (
                      <div key={i} className="draw-ball-sm">{n}</div>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>Total Pool: {formatCurrency(draw.total_pool * 100)}</span>
                  <span>Jackpot: {formatCurrency(draw.jackpot_pool * 100)}</span>
                  {draw.jackpot_rollover > 0 && (
                    <span className="text-gold-400">+{formatCurrency(draw.jackpot_rollover * 100)} rollover</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                {draw.status === 'pending' && (
                  <button onClick={() => handleSimulate(draw)} disabled={saving === draw.id}
                    className="btn-outline text-sm py-2">
                    <Shuffle size={14} /> {saving === draw.id ? 'Running…' : 'Simulate'}
                  </button>
                )}
                {draw.status === 'simulated' && (
                  <>
                    <button onClick={() => handleSimulate(draw)} disabled={saving === draw.id}
                      className="btn-ghost text-sm py-2">
                      <Shuffle size={14} /> Re-simulate
                    </button>
                    <button onClick={() => handlePublish(draw)} disabled={saving === draw.id}
                      className="btn-gold text-sm py-2">
                      <CheckCircle size={14} /> {saving === draw.id ? 'Publishing…' : 'Publish'}
                    </button>
                  </>
                )}
                {draw.status === 'published' && (
                  <span className="flex items-center gap-1.5 text-sm text-emerald-400">
                    <CheckCircle size={14} /> Published
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}

        {draws.length === 0 && (
          <div className="card text-center py-16">
            <BarChart2 size={40} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No draws created yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
