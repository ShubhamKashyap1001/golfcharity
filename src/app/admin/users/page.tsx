'use client';

import { useEffect, useState } from 'react';
import { Search, Shield, User, ChevronDown, Edit3, Check, X } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { formatDate, getStatusBadge, cn } from '@/lib/utils';
import type { Profile, Subscription } from '@/types';
import toast from 'react-hot-toast';

interface UserRow extends Profile {
  subscription?: Subscription;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<'subscriber' | 'admin'>('subscriber');

  const supabase = createSupabaseBrowserClient();

  const fetchUsers = async () => {
    const { data: profiles } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    const { data: subs } = await supabase.from('subscriptions').select('*');
    const merged = (profiles || []).map((p: Profile) => ({
      ...p,
      subscription: (subs || []).find((s: Subscription) => s.user_id === p.id),
    }));
    setUsers(merged as UserRow[]);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleRoleUpdate = async (userId: string) => {
    const { error } = await supabase.from('profiles').update({ role: editRole }).eq('id', userId);
    if (error) toast.error(error.message);
    else { toast.success('Role updated'); setEditId(null); fetchUsers(); }
  };

  const filtered = users.filter(u =>
    u.full_name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Users</h1>
        <p className="page-subtitle">{users.length} total users registered.</p>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input className="input pl-11" placeholder="Search by name or email…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {['User', 'Role', 'Subscription', 'Joined', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(user => (
                <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gold-500/10 flex items-center justify-center text-gold-400 font-bold text-xs">
                        {user.full_name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-white">{user.full_name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    {editId === user.id ? (
                      <div className="flex items-center gap-2">
                        <select className="input py-1 text-xs w-32" value={editRole} onChange={e => setEditRole(e.target.value as any)}>
                          <option value="subscriber">Subscriber</option>
                          <option value="admin">Admin</option>
                        </select>
                        <button onClick={() => handleRoleUpdate(user.id)} className="w-7 h-7 rounded border border-emerald-500/30 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/10">
                          <Check size={12} />
                        </button>
                        <button onClick={() => setEditId(null)} className="w-7 h-7 rounded border border-border flex items-center justify-center text-gray-500 hover:text-white">
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {user.role === 'admin' ? (
                          <span className="badge bg-gold-500/20 text-gold-400 border-gold-500/30 flex items-center gap-1">
                            <Shield size={10} /> Admin
                          </span>
                        ) : (
                          <span className="badge bg-gray-500/20 text-gray-400 border-gray-500/30 flex items-center gap-1">
                            <User size={10} /> Subscriber
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    {user.subscription ? (
                      <div>
                        <span className={cn('badge', getStatusBadge(user.subscription.status))}>
                          {user.subscription.status}
                        </span>
                        <p className="text-xs text-gray-600 mt-1 capitalize">{user.subscription.plan}</p>
                      </div>
                    ) : (
                      <span className="text-gray-600 text-xs">None</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-gray-500 text-xs">{formatDate(user.created_at)}</td>
                  <td className="px-5 py-4">
                    <button onClick={() => { setEditId(user.id); setEditRole(user.role); }}
                      className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-gray-500 hover:text-white hover:border-border-light transition-colors">
                      <Edit3 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
