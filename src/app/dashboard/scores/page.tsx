'use client';

import { useEffect, useState } from 'react';
import { Target, Plus, Trash2, Edit3, Check, X, Info } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { formatDate, cn } from '@/lib/utils';
import type { GolfScore } from '@/types';
import toast from 'react-hot-toast';

export default function ScoresPage() {
  const { user } = useAuthStore();
  const [scores, setScores] = useState<GolfScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ score: '', score_date: new Date().toISOString().split('T')[0], notes: '' });
  const [editForm, setEditForm] = useState({ score: '', score_date: '', notes: '' });
  const [saving, setSaving] = useState(false);

  const supabase = createSupabaseBrowserClient();

  const fetchScores = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('golf_scores')
      .select('*')
      .eq('user_id', user.id)
      .order('score_date', { ascending: false });
    setScores((data as GolfScore[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchScores(); }, [user]);

  const handleAdd = async () => {
    if (!user) return;
    const scoreVal = parseInt(form.score);
    if (isNaN(scoreVal) || scoreVal < 1 || scoreVal > 45) {
      toast.error('Score must be between 1 and 45');
      return;
    }
    setSaving(true);
    const { error } = await supabase.from('golf_scores').insert({
      user_id: user.id,
      score: scoreVal,
      score_date: form.score_date,
      notes: form.notes || null,
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Score added! Rolling window auto-managed.');
      setForm({ score: '', score_date: new Date().toISOString().split('T')[0], notes: '' });
      setAdding(false);
      fetchScores();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this score?')) return;
    const { error } = await supabase.from('golf_scores').delete().eq('id', id);
    if (error) toast.error(error.message);
    else { toast.success('Score deleted'); fetchScores(); }
  };

  const handleEdit = async (id: string) => {
    const scoreVal = parseInt(editForm.score);
    if (isNaN(scoreVal) || scoreVal < 1 || scoreVal > 45) {
      toast.error('Score must be between 1 and 45');
      return;
    }
    setSaving(true);
    const { error } = await supabase.from('golf_scores').update({
      score: scoreVal,
      score_date: editForm.score_date,
      notes: editForm.notes || null,
    }).eq('id', id);
    if (error) toast.error(error.message);
    else { toast.success('Score updated'); setEditId(null); fetchScores(); }
    setSaving(false);
  };

  const startEdit = (score: GolfScore) => {
    setEditId(score.id);
    setEditForm({ score: score.score.toString(), score_date: score.score_date, notes: score.notes || '' });
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title">My Scores</h1>
          <p className="page-subtitle">Log your Stableford scores. Only your 5 most recent are stored.</p>
        </div>
        {scores.length < 5 && !adding && (
          <button onClick={() => setAdding(true)} className="btn-gold">
            <Plus size={16} /> Add Score
          </button>
        )}
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 rounded-xl border border-blue-500/20 bg-blue-500/5">
        <Info size={16} className="text-blue-400 shrink-0 mt-0.5" />
        <p className="text-sm text-gray-400">
          You can store up to <strong className="text-white">5 scores</strong> at a time (Stableford format, 1–45 points each).
          When you add a 6th score, the oldest is automatically removed. These scores determine your monthly draw entry numbers.
        </p>
      </div>

      {/* Score slots visualizer */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-lg font-semibold text-white">Score Slots</h2>
          <span className="text-sm text-gray-500">{scores.length}/5 used</span>
        </div>
        <div className="flex gap-3">
          {Array(5).fill(0).map((_, i) => {
            const score = scores[i];
            return (
              <div key={i} className={cn(
                'flex-1 h-16 rounded-xl border-2 flex flex-col items-center justify-center transition-all',
                score ? 'border-gold-500/40 bg-gold-500/5' : 'border-border border-dashed'
              )}>
                {score ? (
                  <>
                    <span className="font-display text-2xl font-bold text-gold-400">{score.score}</span>
                    <span className="text-xs text-gray-600">{formatDate(score.score_date)}</span>
                  </>
                ) : (
                  <span className="text-gray-700 text-2xl font-display">—</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Add score form */}
      {adding && (
        <div className="card border-gold-500/30">
          <h3 className="font-display text-lg font-semibold text-white mb-5">Add New Score</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Stableford Score (1–45)</label>
              <input type="number" min={1} max={45} className="input" placeholder="e.g. 32"
                value={form.score} onChange={e => setForm(f => ({ ...f, score: e.target.value }))} />
            </div>
            <div>
              <label className="label">Date Played</label>
              <input type="date" className="input" value={form.score_date}
                onChange={e => setForm(f => ({ ...f, score_date: e.target.value }))} />
            </div>
            <div>
              <label className="label">Notes (optional)</label>
              <input type="text" className="input" placeholder="Course name, weather…"
                value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
          </div>
          {scores.length >= 5 && (
            <p className="text-xs text-amber-400 mt-3">⚠ Adding this score will remove your oldest score ({formatDate(scores[scores.length - 1].score_date)}).</p>
          )}
          <div className="flex items-center gap-3 mt-5">
            <button onClick={handleAdd} disabled={saving} className="btn-gold">
              {saving ? 'Saving…' : <><Check size={16} /> Save Score</>}
            </button>
            <button onClick={() => setAdding(false)} className="btn-outline"><X size={16} /> Cancel</button>
          </div>
        </div>
      )}

      {/* Scores list */}
      <div className="card">
        <h2 className="font-display text-lg font-semibold text-white mb-5">Score History</h2>
        {scores.length === 0 ? (
          <div className="text-center py-12">
            <Target size={40} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No scores yet. Add your first Stableford score above.</p>
            <button onClick={() => setAdding(true)} className="btn-gold mt-4 inline-flex"><Plus size={16} /> Add Score</button>
          </div>
        ) : (
          <div className="space-y-3">
            {scores.map((score, i) => (
              <div key={score.id} className="p-4 rounded-xl border border-border bg-dark hover:border-border-light transition-all">
                {editId === score.id ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input type="number" min={1} max={45} className="input" value={editForm.score}
                      onChange={e => setEditForm(f => ({ ...f, score: e.target.value }))} />
                    <input type="date" className="input" value={editForm.score_date}
                      onChange={e => setEditForm(f => ({ ...f, score_date: e.target.value }))} />
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(score.id)} disabled={saving} className="btn-gold flex-1 justify-center text-sm py-2">
                        {saving ? '…' : <><Check size={14} /> Save</>}
                      </button>
                      <button onClick={() => setEditId(null)} className="btn-outline flex-1 justify-center text-sm py-2"><X size={14} /></button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-400 font-display font-bold text-xl">
                      {score.score}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">Stableford Score</span>
                        {i === 0 && <span className="text-xs bg-gold-500/20 text-gold-400 px-2 py-0.5 rounded-full font-medium">Latest</span>}
                        {i === scores.length - 1 && scores.length >= 5 && <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-medium">Oldest (next to go)</span>}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-gray-500">{formatDate(score.score_date)}</span>
                        {score.notes && <span className="text-xs text-gray-600">• {score.notes}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => startEdit(score)} className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-gray-500 hover:text-white hover:border-border-light transition-colors">
                        <Edit3 size={13} />
                      </button>
                      <button onClick={() => handleDelete(score.id)} className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-gray-500 hover:text-ruby-400 hover:border-ruby-500/30 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
