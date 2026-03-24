'use client';

import { useEffect, useState, useCallback } from 'react';
import { Trophy, Upload, CheckCircle, XCircle, Clock, FileImage } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { useAuthStore } from '@/store/auth';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { formatCurrency, formatDate, getMonthName, getStatusBadge, getMatchLabel, cn } from '@/lib/utils';
import type { Winner } from '@/types';
import toast from 'react-hot-toast';

export default function WinningsPage() {
  const { user } = useAuthStore();
  const [winners, setWinners] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);

  const supabase = createSupabaseBrowserClient();

  const fetchWinners = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('winners')
      .select('*, draw:draws(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setWinners((data as Winner[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchWinners(); }, [user]);

  const handleUpload = async (winnerId: string, file: File) => {
    if (!user) return;
    setUploading(winnerId);
    const ext = file.name.split('.').pop();
    const path = `proofs/${user.id}/${winnerId}.${ext}`;
    const { error: upErr } = await supabase.storage.from('winner-proofs').upload(path, file, { upsert: true });
    if (upErr) { toast.error('Upload failed: ' + upErr.message); setUploading(null); return; }
    const { data: urlData } = supabase.storage.from('winner-proofs').getPublicUrl(path);
    const { error: updateErr } = await supabase.from('winners').update({ proof_url: urlData.publicUrl }).eq('id', winnerId);
    if (updateErr) toast.error(updateErr.message);
    else { toast.success('Proof uploaded! Awaiting admin verification.'); fetchWinners(); }
    setUploading(null);
  };

  const totalWon = winners.filter(w => w.status === 'paid').reduce((sum, w) => sum + w.prize_amount, 0);
  const pending = winners.filter(w => ['pending_verification', 'approved'].includes(w.status)).reduce((sum, w) => sum + w.prize_amount, 0);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="page-header">
        <h1 className="page-title">My Winnings</h1>
        <p className="page-subtitle">Track your prizes and upload verification proofs.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Won', value: formatCurrency(totalWon * 100), color: 'text-gold-400' },
          { label: 'Pending Payout', value: formatCurrency(pending * 100), color: 'text-amber-400' },
          { label: 'Total Prizes', value: winners.length.toString(), color: 'text-white' },
          { label: 'Paid Out', value: winners.filter(w => w.status === 'paid').length.toString(), color: 'text-emerald-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="stat-card">
            <p className={cn('font-display text-2xl font-bold', color)}>{value}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {winners.length === 0 ? (
        <div className="card text-center py-16">
          <Trophy size={40} className="text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-2">No prizes won yet — but keep playing!</p>
          <p className="text-xs text-gray-600">Your Stableford scores enter you into the monthly draw automatically.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {winners.map(winner => (
            <WinnerCard
              key={winner.id}
              winner={winner}
              uploading={uploading === winner.id}
              onUpload={(file) => handleUpload(winner.id, file)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function WinnerCard({ winner, uploading, onUpload }: {
  winner: Winner;
  uploading: boolean;
  onUpload: (file: File) => void;
}) {
  const onDrop = useCallback((files: File[]) => {
    if (files[0]) onUpload(files[0]);
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'], 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    disabled: uploading || winner.status !== 'pending_verification',
  });

  const statusIcons: Record<string, React.ReactNode> = {
    pending_verification: <Clock size={16} className="text-amber-400" />,
    approved: <CheckCircle size={16} className="text-emerald-400" />,
    rejected: <XCircle size={16} className="text-ruby-400" />,
    paid: <CheckCircle size={16} className="text-gold-400" />,
  };

  return (
    <div className={cn('card', winner.status === 'paid' && 'border-gold-500/30 bg-gold-500/5')}>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center">
              <Trophy size={18} className="text-gold-400" />
            </div>
            <div>
              <p className="font-display text-lg font-semibold text-white">
                {winner.draw ? `${getMonthName(winner.draw.draw_month)} ${winner.draw.draw_year}` : 'Prize Draw'}
              </p>
              <p className="text-sm text-gray-400">{getMatchLabel(winner.match_type)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs text-gray-500">Matched numbers:</span>
            {winner.matched_numbers.map((n, i) => (
              <span key={i} className="draw-ball-sm">{n}</span>
            ))}
          </div>
          {winner.admin_notes && (
            <p className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
              Admin note: {winner.admin_notes}
            </p>
          )}
        </div>

        <div className="sm:text-right sm:min-w-[180px] space-y-3">
          <div>
            <p className="text-xs text-gray-500 mb-1">Prize Amount</p>
            <p className="font-display text-3xl text-gold-400 font-bold">{formatCurrency(winner.prize_amount * 100)}</p>
          </div>
          <div className="flex sm:justify-end items-center gap-2">
            {statusIcons[winner.status]}
            <span className={cn('badge', getStatusBadge(winner.status))}>{winner.status.replace(/_/g, ' ')}</span>
          </div>
          {winner.paid_at && (
            <p className="text-xs text-gray-600">Paid {formatDate(winner.paid_at)}</p>
          )}
        </div>
      </div>

      {/* Proof upload */}
      {winner.status === 'pending_verification' && (
        <div className="mt-5 pt-5 border-t border-border">
          <p className="text-sm font-medium text-white mb-3">Upload Score Verification</p>
          <p className="text-xs text-gray-500 mb-3">Upload a screenshot of your scores from your golf platform to verify your win.</p>
          {winner.proof_url ? (
            <div className="flex items-center gap-3 p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5">
              <FileImage size={16} className="text-emerald-400" />
              <span className="text-sm text-emerald-400">Proof uploaded — awaiting review</span>
              <a href={winner.proof_url} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:text-white ml-auto">View</a>
            </div>
          ) : (
            <div {...getRootProps()} className={cn(
              'border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all',
              isDragActive ? 'border-gold-500 bg-gold-500/10' : 'border-border hover:border-border-light'
            )}>
              <input {...getInputProps()} />
              {uploading ? (
                <div className="flex items-center justify-center gap-2 text-gold-400">
                  <div className="w-4 h-4 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm">Uploading…</span>
                </div>
              ) : (
                <>
                  <Upload size={24} className="text-gray-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Drop your proof here or click to browse</p>
                  <p className="text-xs text-gray-600 mt-1">PNG, JPG, PDF up to 10MB</p>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
