'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Shield, Users, Ticket, Heart, Trophy, BarChart3, Menu, Home, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: BarChart3 },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/draws', label: 'Draws', icon: Ticket },
  { href: '/admin/charities', label: 'Charities', icon: Heart },
  { href: '/admin/winners', label: 'Winners', icon: Trophy },
  { href: '/admin/reports', label: 'Reports', icon: BarChart3 },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, isLoading } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!user) router.push('/auth/login');
      else if (!isAdmin()) router.push('/dashboard');
    }
  }, [user, isLoading, isAdmin, router]);

  const handleSignOut = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    useAuthStore.getState().reset();
    toast.success('Signed out');
    router.push('/');
  };

  if (isLoading || !user) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-black flex">
      <aside className={cn(
        'fixed inset-y-0 left-0 z-40 w-64 bg-off-black border-r border-border flex flex-col transition-transform duration-200',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      )}>
        <div className="p-5 border-b border-border">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gold-gradient flex items-center justify-center text-black font-bold text-xs">G</div>
            <span className="font-display text-lg font-semibold">Golf<span className="text-gold-500">Charity</span></span>
          </Link>
          <div className="flex items-center gap-1.5 mt-2">
            <Shield size={12} className="text-gold-400" />
            <span className="text-xs text-gold-400 font-medium uppercase tracking-wider">Admin Panel</span>
          </div>
        </div>

        <div className="p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gold-500/20 flex items-center justify-center text-gold-400 font-bold text-sm">
              {user.full_name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-medium text-white">{user.full_name}</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                pathname === href ? 'bg-gold-500/15 text-gold-400 font-medium' : 'text-gray-400 hover:text-white hover:bg-white/5'
              )}>
              <Icon size={17} />{label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-border space-y-1">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
            <Home size={17} /> User Dashboard
          </Link>
          <button onClick={handleSignOut} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-ruby-400 hover:text-ruby-300 hover:bg-ruby-500/5 transition-colors">
            <LogOut size={17} /> Sign Out
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)} />}

      <main className="flex-1 md:ml-64">
        <div className="md:hidden flex items-center justify-between px-4 h-14 border-b border-border bg-off-black sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-400"><Menu size={20} /></button>
          <span className="text-xs text-gold-400 font-medium uppercase tracking-wider flex items-center gap-1.5"><Shield size={12} /> Admin</span>
          <div className="w-6" />
        </div>
        <div className="p-6 md:p-8 max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
