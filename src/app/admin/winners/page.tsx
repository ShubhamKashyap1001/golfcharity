'use client';

import { useEffect, useState } from 'react';
import { Trophy, CheckCircle, XCircle, ExternalLink, Filter } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { formatCurrency, formatDate, getMonthName, getStatusBadge, getMatchLabel, cn } from '@/lib/utils';
import type { Winner, Profile, Draw } from '@/types';
import toast from 'react-hot-toast';

interface WinnerRow extends Winner {
  profile?: Profile;
  draw?: Draw;
}

export default function AdminWinnersPage() {
  const [winners, setWinners] = useState<WinnerRow[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});

  const supabase = createSupabaseBrowserClient();

  const fetchWinners = async () => {
    const { data } = await supabase
      .from('winners')
      .select('*, profile:profiles(*), draw:draws(*)')
      .order('created_at', { ascending: false });
    setWinners((data as WinnerRow[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchWinners(); }, []);

  const handleApprove = async (winner: WinnerRow) => {
    setProcessing(winner.id);
    const { error } = await supabase.from('winners').update({
      status: 'approved',
      admin_notes: adminNotes[winner.id] || null,
      verified_at: new Date().toISOString(),
    }).eq('id', winner.id);
    if (error) toast.error(error.message);
    else { toast.success('Winner approved!'); fetchWinners(); }
    setProcessing(null);
  };

  const handleReject = async (winner: WinnerRow) => {
    if (!adminNotes[winner.id]) { toast.error('Please add a rejection reason in the notes'); return; }
    setProcessing(winner.id);
    const { error } = await supabase.from('winners').update({
      status: 'rejected',
      admin_notes: adminNotes[winner.id],
      verified_at: new Date().toISOString(),
    }).eq('id', winner.id);
    if (error) toast.error(error.message);
    else { toast.success('Winner rejected'); fetchWinners(); }
    setProcessing(null);
  };

  const handleMarkPaid = async (winner: WinnerRow) => {
    setProcessing(winner.id);
    const { error } = await supabase.from('winners').update({
      status: 'paid',
      paid_at: new Date().toISOString(),
    }).eq('id', winner.id);
    if (error) toast.error(error.message);
    else { toast.success('Marked as paid'); fetchWinners(); }
    setProcessing(null);
  };

  const filtered = filter === 'all' ? winners : winners.filter(w => w.status === filter);
  const pendingCount = winners.filter(w => w.status === 'pending_verification').length;

  const STATUS_FILTERS = ['all', 'pending_verification', 'approved', 'rejected', 'paid'];

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Winners Management</h1>
        <p className="page-subtitle">Verify proofs and track prize payouts.</p>
      </div>

      {pendingCount > 0 && (
        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5">
          <p className="text-amber-300 text-sm"><strong>{pendingCount}</strong> winner{pendingCount !== 1 ? 's' : ''} awaiting verification.</p>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_FILTERS.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={cn('px-4 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize',
              filter === s ? 'bg-gold-500/20 text-gold-400 border border-gold-500/30' : 'text-gray-500 border border-border hover:text-white hover:border-border-light'
            )}>
            {s.replace(/_/g, ' ')}
            {s === 'pending_verification' && pendingCount > 0 && (
              <span className="ml-1.5 bg-amber-500 text-black text-xs rounded-full px-1.5 py-0.5">{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Winners list */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="card text-center py-12">
            <Trophy size={32} className="text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No winners in this category.</p>
          </div>
        ) : (
          filtered.map(winner => (
            <div key={winner.id} className="card">
              <div className="flex flex-col sm:flex-row gap-5">
                {/* Left: Winner info */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-400 font-bold">
                      {winner.profile?.full_name.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="font-medium text-white">{winner.profile?.full_name || 'Unknown'}</p>
                      <p className="text-xs text-gray-500">{winner.profile?.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Draw</p>
                      <p className="text-white">{winner.draw ? `${getMonthName(winner.draw.draw_month)} ${winner.draw.draw_year}` : '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Match Type</p>
                      <p className="text-white">{getMatchLabel(winner.match_type)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Prize Amount</p>
                      <p className="font-display text-lg text-gold-400 font-bold">{formatCurrency(winner.prize_amount * 100)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Matched Numbers</p>
                      <div className="flex gap-1">
                        {winner.matched_numbers.map((n, i) => (
                          <span key={i} className="draw-ball-sm">{n}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Proof */}
                  {winner.proof_url ? (
                    <a href={winner.proof_url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 text-emerald-400 text-sm hover:bg-emerald-500/10 transition-colors">
                      <ExternalLink size={13} /> View Submitted Proof
                    </a>
                  ) : (
                    <p className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                      ⚠ No proof uploaded yet
                    </p>
                  )}

                  {winner.admin_notes && (
                    <p className="text-xs text-gray-500 bg-dark rounded-lg px-3 py-2 border border-border">
                      Notes: {winner.admin_notes}
                    </p>
                  )}
                </div>

                {/* Right: Status & Actions */}
                <div className="sm:w-56 flex flex-col gap-3">
                  <span className={cn('badge self-start', getStatusBadge(winner.status))}>
                    {winner.status.replace(/_/g, ' ')}
                  </span>

                  {winner.verified_at && (
                    <p className="text-xs text-gray-600">Verified: {formatDate(winner.verified_at)}</p>
                  )}
                  {winner.paid_at && (
                    <p className="text-xs text-gray-600">Paid: {formatDate(winner.paid_at)}</p>
                  )}

                  {winner.status === 'pending_verification' && (
                    <>
                      <div>
                        <label className="label text-xs">Admin Notes</label>
                        <textarea
                          className="input text-xs h-16 resize-none"
                          placeholder="Notes (required for rejection)"
                          value={adminNotes[winner.id] || ''}
                          onChange={e => setAdminNotes(n => ({ ...n, [winner.id]: e.target.value }))}
                        />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleApprove(winner)} disabled={processing === winner.id}
                          className="flex-1 btn-gold text-xs py-2 justify-center">
                          <CheckCircle size={13} /> Approve
                        </button>
                        <button onClick={() => handleReject(winner)} disabled={processing === winner.id}
                          className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 text-xs border border-ruby-500/30 text-ruby-400 rounded-lg hover:bg-ruby-500/10 transition-colors">
                          <XCircle size={13} /> Reject
                        </button>
                      </div>
                    </>
                  )}

                  {winner.status === 'approved' && (
                    <button onClick={() => handleMarkPaid(winner)} disabled={processing === winner.id}
                      className="btn-gold text-sm py-2 justify-center">
                      {processing === winner.id ? 'Processing…' : '✓ Mark as Paid'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
