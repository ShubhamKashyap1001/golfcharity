'use client';

import { useEffect, useState } from 'react';
import { Heart, Search, ExternalLink, Check, Sliders } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { formatCurrency, cn } from '@/lib/utils';
import type { Charity, UserCharity } from '@/types';
import toast from 'react-hot-toast';

export default function CharityPage() {
  const { user } = useAuthStore();
  const [charities, setCharities] = useState<Charity[]>([]);
  const [userCharity, setUserCharity] = useState<UserCharity | null>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [donationPct, setDonationPct] = useState(10);
  const [selecting, setSelecting] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from('charities').select('*').eq('is_active', true).order('is_featured', { ascending: false }),
      supabase.from('user_charities').select('*, charity:charities(*)').eq('user_id', user.id).eq('is_active', true).single(),
    ]).then(([c, uc]) => {
      setCharities((c.data as Charity[]) || []);
      if (uc.data) {
        setUserCharity(uc.data as UserCharity);
        setDonationPct(uc.data.donation_percentage);
      }
      setLoading(false);
    });
  }, [user]);

  const categories = [...new Set(charities.map(c => c.category).filter(Boolean))];

  const filtered = charities.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = !category || c.category === category;
    return matchSearch && matchCat;
  });

  const handleSelect = async (charityId: string) => {
    if (!user) return;
    setSaving(true);
    // Deactivate old selection
    await supabase.from('user_charities').update({ is_active: false }).eq('user_id', user.id).eq('is_active', true);
    // Insert new
    const { error } = await supabase.from('user_charities').insert({
      user_id: user.id,
      charity_id: charityId,
      donation_percentage: donationPct,
      is_active: true,
    });
    if (error) toast.error(error.message);
    else {
      toast.success('Charity updated!');
      const { data } = await supabase.from('user_charities').select('*, charity:charities(*)').eq('user_id', user.id).eq('is_active', true).single();
      setUserCharity(data as UserCharity);
    }
    setSelecting(null);
    setSaving(false);
  };

  const handleUpdatePercentage = async () => {
    if (!userCharity || !user) return;
    setSaving(true);
    const { error } = await supabase.from('user_charities').update({ donation_percentage: donationPct }).eq('id', userCharity.id);
    if (error) toast.error(error.message);
    else toast.success('Donation percentage updated!');
    setSaving(false);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="page-header">
        <h1 className="page-title">My Charity</h1>
        <p className="page-subtitle">Choose which charity receives part of your subscription.</p>
      </div>

      {/* Current selection */}
      {userCharity && (
        <div className="card border-gold-500/30 bg-gold-500/5">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-gold-500/20 border border-gold-500/30 flex items-center justify-center text-gold-400 font-display font-bold text-2xl">
              {userCharity.charity?.name.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-display text-xl font-semibold text-white">{userCharity.charity?.name}</h2>
                <span className="badge bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">Active</span>
              </div>
              <p className="text-sm text-gray-400 mb-4">{userCharity.charity?.short_description}</p>
              {/* Percentage slider */}
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs text-gray-500">Donation percentage</label>
                    <span className="text-sm font-bold text-gold-400">{donationPct}%</span>
                  </div>
                  <input type="range" min={10} max={100} step={5} value={donationPct}
                    onChange={e => setDonationPct(parseInt(e.target.value))}
                    className="w-full accent-yellow-400 cursor-pointer" />
                  <div className="flex justify-between text-xs text-gray-600 mt-0.5">
                    <span>10% (min)</span><span>100%</span>
                  </div>
                </div>
                <button onClick={handleUpdatePercentage} disabled={saving} className="btn-gold text-sm py-2 shrink-0">
                  {saving ? '…' : 'Update'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Donation info */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Minimum Donation', value: '10%', desc: 'of every subscription' },
          { label: 'Your Current Rate', value: `${donationPct}%`, desc: 'of your subscription', highlight: true },
          { label: 'Total Raised', value: userCharity?.charity ? formatCurrency(userCharity.charity.total_raised * 100) : '—', desc: 'by this charity total' },
        ].map(({ label, value, desc, highlight }) => (
          <div key={label} className={cn('stat-card', highlight && 'border-gold-500/30')}>
            <p className={cn('font-display text-3xl font-bold', highlight ? 'text-gold-400' : 'text-white')}>{value}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
            <p className="text-xs text-gray-600">{desc}</p>
          </div>
        ))}
      </div>

      {/* Search & filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input className="input pl-11" placeholder="Search charities…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input w-44" value={category} onChange={e => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c!}>{c}</option>)}
        </select>
      </div>

      {/* Charity grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(charity => {
          const isSelected = userCharity?.charity_id === charity.id;
          return (
            <div key={charity.id} className={cn(
              'card-hover flex flex-col gap-4 cursor-pointer transition-all',
              isSelected && 'border-gold-500/40 bg-gold-500/5'
            )}>
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-400 font-display font-bold text-xl shrink-0">
                  {charity.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white text-sm truncate">{charity.name}</h3>
                    {isSelected && <Check size={13} className="text-gold-400 shrink-0" />}
                  </div>
                  {charity.category && <span className="text-xs text-gray-500">{charity.category}</span>}
                </div>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed flex-1">
                {charity.short_description || charity.description.slice(0, 100) + '…'}
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div>
                  <p className="text-xs text-gray-500">Total Raised</p>
                  <p className="font-display text-base text-gold-400 font-semibold">{formatCurrency(charity.total_raised * 100)}</p>
                </div>
                {isSelected ? (
                  <span className="badge bg-gold-500/20 text-gold-400 border-gold-500/30">Selected</span>
                ) : (
                  <button onClick={() => { setSelecting(charity.id); handleSelect(charity.id); }}
                    disabled={saving && selecting === charity.id}
                    className="btn-outline text-xs py-1.5 px-3">
                    {saving && selecting === charity.id ? '…' : 'Select'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
