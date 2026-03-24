'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit3, Trash2, Star, Check, X, ToggleLeft, ToggleRight } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { formatCurrency, cn } from '@/lib/utils';
import type { Charity } from '@/types';
import toast from 'react-hot-toast';

const emptyForm = { name: '', description: '', short_description: '', category: '', website_url: '', registered_number: '' };

export default function AdminCharitiesPage() {
  const [charities, setCharities] = useState<Charity[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const supabase = createSupabaseBrowserClient();

  const fetchCharities = async () => {
    const { data } = await supabase.from('charities').select('*').order('created_at', { ascending: false });
    setCharities((data as Charity[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchCharities(); }, []);

  const handleSave = async () => {
    if (!form.name || !form.description) { toast.error('Name and description are required'); return; }
    setSaving(true);
    if (editId) {
      const { error } = await supabase.from('charities').update(form).eq('id', editId);
      if (error) toast.error(error.message);
      else { toast.success('Charity updated'); setEditId(null); }
    } else {
      const { error } = await supabase.from('charities').insert({ ...form, is_active: true, is_featured: false, total_raised: 0 });
      if (error) toast.error(error.message);
      else { toast.success('Charity created'); setCreating(false); }
    }
    setForm(emptyForm);
    fetchCharities();
    setSaving(false);
  };

  const handleToggleActive = async (charity: Charity) => {
    const { error } = await supabase.from('charities').update({ is_active: !charity.is_active }).eq('id', charity.id);
    if (error) toast.error(error.message);
    else { toast.success(`Charity ${charity.is_active ? 'deactivated' : 'activated'}`); fetchCharities(); }
  };

  const handleToggleFeatured = async (charity: Charity) => {
    // Only one featured at a time
    await supabase.from('charities').update({ is_featured: false }).neq('id', charity.id);
    const { error } = await supabase.from('charities').update({ is_featured: !charity.is_featured }).eq('id', charity.id);
    if (error) toast.error(error.message);
    else { toast.success('Featured charity updated'); fetchCharities(); }
  };

  const startEdit = (c: Charity) => {
    setEditId(c.id);
    setForm({ name: c.name, description: c.description, short_description: c.short_description || '', category: c.category || '', website_url: c.website_url || '', registered_number: c.registered_number || '' });
    setCreating(false);
  };

  const FormFields = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="sm:col-span-2"><label className="label">Charity Name *</label><input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Golf Foundation" /></div>
      <div className="sm:col-span-2"><label className="label">Short Description</label><input className="input" value={form.short_description} onChange={e => setForm(f => ({ ...f, short_description: e.target.value }))} placeholder="One-line summary" /></div>
      <div className="sm:col-span-2"><label className="label">Full Description *</label><textarea className="input h-24 resize-none" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Full charity description…" /></div>
      <div><label className="label">Category</label><input className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="e.g. Health & Wellbeing" /></div>
      <div><label className="label">Website URL</label><input className="input" value={form.website_url} onChange={e => setForm(f => ({ ...f, website_url: e.target.value }))} placeholder="https://…" /></div>
      <div><label className="label">Registered Number</label><input className="input" value={form.registered_number} onChange={e => setForm(f => ({ ...f, registered_number: e.target.value }))} placeholder="Charity reg number" /></div>
    </div>
  );

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between page-header">
        <div>
          <h1 className="page-title">Charities</h1>
          <p className="page-subtitle">Manage charity listings and their details.</p>
        </div>
        <button onClick={() => { setCreating(!creating); setEditId(null); setForm(emptyForm); }} className="btn-gold">
          <Plus size={16} /> Add Charity
        </button>
      </div>

      {/* Create form */}
      {creating && (
        <div className="card border-gold-500/30">
          <h3 className="font-display text-lg font-semibold text-white mb-5">Add New Charity</h3>
          <FormFields />
          <div className="flex gap-3 mt-5">
            <button onClick={handleSave} disabled={saving} className="btn-gold">{saving ? 'Saving…' : <><Check size={15} /> Save</>}</button>
            <button onClick={() => setCreating(false)} className="btn-outline"><X size={15} /> Cancel</button>
          </div>
        </div>
      )}

      {/* Edit form */}
      {editId && (
        <div className="card border-blue-500/30">
          <h3 className="font-display text-lg font-semibold text-white mb-5">Edit Charity</h3>
          <FormFields />
          <div className="flex gap-3 mt-5">
            <button onClick={handleSave} disabled={saving} className="btn-gold">{saving ? 'Saving…' : <><Check size={15} /> Update</>}</button>
            <button onClick={() => { setEditId(null); setForm(emptyForm); }} className="btn-outline"><X size={15} /> Cancel</button>
          </div>
        </div>
      )}

      {/* Charities list */}
      <div className="space-y-3">
        {charities.map(charity => (
          <div key={charity.id} className={cn('card', !charity.is_active && 'opacity-60')}>
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-400 font-display font-bold text-xl shrink-0">
                {charity.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-white">{charity.name}</h3>
                  {charity.is_featured && <span className="badge bg-gold-500/20 text-gold-400 border-gold-500/30 text-xs flex items-center gap-1"><Star size={9} /> Featured</span>}
                  {!charity.is_active && <span className="badge bg-gray-500/20 text-gray-500 border-gray-500/30 text-xs">Inactive</span>}
                  {charity.category && <span className="badge bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">{charity.category}</span>}
                </div>
                <p className="text-sm text-gray-400 line-clamp-1">{charity.short_description || charity.description.slice(0, 80) + '…'}</p>
                <p className="text-xs text-gold-400 mt-1">Total Raised: {formatCurrency(charity.total_raised * 100)}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => handleToggleFeatured(charity)} title={charity.is_featured ? 'Remove featured' : 'Set as featured'}
                  className={cn('w-8 h-8 rounded-lg border flex items-center justify-center transition-colors', charity.is_featured ? 'border-gold-500/40 text-gold-400 bg-gold-500/10' : 'border-border text-gray-500 hover:text-gold-400')}>
                  <Star size={13} fill={charity.is_featured ? 'currentColor' : 'none'} />
                </button>
                <button onClick={() => handleToggleActive(charity)} title={charity.is_active ? 'Deactivate' : 'Activate'}
                  className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-gray-500 hover:text-white transition-colors">
                  {charity.is_active ? <ToggleRight size={13} className="text-emerald-400" /> : <ToggleLeft size={13} />}
                </button>
                <button onClick={() => startEdit(charity)}
                  className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-gray-500 hover:text-white transition-colors">
                  <Edit3 size={13} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
