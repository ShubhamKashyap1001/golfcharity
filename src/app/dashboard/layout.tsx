'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Target, Heart, Ticket, Trophy, CreditCard, LogOut, Menu, Shield } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { cn, getStatusBadge } from '@/lib/utils';
import toast from 'react-hot-toast';

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/scores', label: 'My Scores', icon: Target },
  { href: '/dashboard/charity', label: 'My Charity', icon: Heart },
  { href: '/dashboard/draws', label: 'Draw History', icon: Ticket },
  { href: '/dashboard/winnings', label: 'Winnings', icon: Trophy },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, subscription, isLoading, setSubscription } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // true while we are re-fetching subscription after Stripe redirect
  const [rehydrating, setRehydrating] = useState(false);

  // After Stripe redirects back with ?payment=success, the store subscription
  // is stale (still null/inactive). Re-fetch it directly from DB right now.
  useEffect(() => {
    if (searchParams.get('payment') !== 'success') return;
    if (!user) return;

    setRehydrating(true);
    const supabase = createSupabaseBrowserClient();

    // Poll up to 8 times (8s) waiting for the webhook to write the subscription
    let attempts = 0;
    const poll = async () => {
      attempts++;
      const { data } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        setSubscription(data);
        toast.success('Payment confirmed! Welcome aboard 🎉');
        setRehydrating(false);
      } else if (attempts < 8) {
        setTimeout(poll, 1000);
      } else {
        // Webhook may be slow — let them in anyway, page will show pending state
        setRehydrating(false);
      }
    };
    poll();
  }, [searchParams, user, setSubscription]);

  useEffect(() => {
    if (isLoading || rehydrating) return;

    if (!user) {
      router.push('/auth/login');
      return;
    }

    // Admins always have access — no subscription needed
    if (user.role === 'admin') return;

    const hasAccess = subscription?.status === 'active';
    const isSubPage = pathname === '/dashboard/subscription';
    if (!hasAccess && !isSubPage) {
      router.push('/dashboard/subscription');
    }
  }, [user, isLoading, rehydrating, subscription, pathname, router]);

  const handleSignOut = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    useAuthStore.getState().reset();
    toast.success('Signed out');
    router.push('/');
  };

  if (isLoading || rehydrating) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-500 text-sm">
            {rehydrating ? 'Confirming your payment…' : 'Loading your account…'}
          </p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const isAdmin = user.role === 'admin';

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
        </div>

        <div className="p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gold-500/20 flex items-center justify-center text-gold-400 font-bold">
              {user.full_name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.full_name}</p>
              {isAdmin ? (
                <span className="badge text-xs mt-0.5 bg-gold-500/20 text-gold-400 border-gold-500/30 flex items-center gap-1 w-fit">
                  <Shield size={9} /> Admin
                </span>
              ) : (
                <span className={cn('badge text-xs mt-0.5', getStatusBadge(subscription?.status || 'inactive'))}>
                  {subscription?.status || 'No Plan'}
                </span>
              )}
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                pathname === href
                  ? 'bg-gold-500/15 text-gold-400 font-medium'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              )}>
              <Icon size={17} />{label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-border space-y-1">
          {!isAdmin && (
            <Link href="/dashboard/subscription"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
              <CreditCard size={17} /> Subscription
            </Link>
          )}
          {isAdmin && (
            <Link href="/admin"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gold-400 hover:text-gold-300 hover:bg-gold-500/5 transition-colors">
              <Shield size={17} /> Admin Panel
            </Link>
          )}
          <button onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-ruby-400 hover:text-ruby-300 hover:bg-ruby-500/5 transition-colors">
            <LogOut size={17} /> Sign Out
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <main className="flex-1 md:ml-64">
        <div className="md:hidden flex items-center justify-between px-4 h-14 border-b border-border bg-off-black sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-400"><Menu size={20} /></button>
          <span className="font-display text-lg">Golf<span className="text-gold-500">Charity</span></span>
          <div className="w-6" />
        </div>
        <div className="p-6 md:p-8 max-w-6xl">
          {children}
        </div>
      </main>
    </div>
  );
}