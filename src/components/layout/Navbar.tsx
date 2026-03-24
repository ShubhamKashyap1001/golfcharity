'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, ChevronDown, LogOut, User, LayoutDashboard, Shield } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAdmin, isSubscribed } = useAuthStore();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const handleSignOut = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    useAuthStore.getState().reset();
    toast.success('Signed out');
    router.push('/');
  };

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/charities', label: 'Charities' },
    { href: '/about', label: 'About' },
  ];

  return (
    <nav className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      scrolled ? 'bg-off-black/95 backdrop-blur-md border-b border-border shadow-card' : 'bg-transparent'
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-full bg-gold-gradient flex items-center justify-center text-black font-bold text-sm shadow-gold group-hover:shadow-gold-lg transition-shadow">
              G
            </div>
            <span className="font-display text-xl font-semibold text-white">
              Golf<span className="text-gold-500">Charity</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-sm font-medium transition-colors duration-200',
                  pathname === link.href ? 'text-gold-400' : 'text-gray-400 hover:text-white'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth Actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:border-border-light transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-gold-500/20 flex items-center justify-center text-gold-400 text-xs font-bold">
                    {user.full_name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-white">{user.full_name.split(' ')[0]}</span>
                  <ChevronDown size={14} className={cn('text-gray-400 transition-transform', dropdownOpen && 'rotate-180')} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-dark-card border border-border rounded-xl shadow-card-hover overflow-hidden">
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-sm font-medium text-white">{user.full_name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <div className="py-2">
                      <Link href="/dashboard" onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                        <LayoutDashboard size={15} /> Dashboard
                      </Link>
                      <Link href="/dashboard/scores" onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                        <User size={15} /> My Scores
                      </Link>
                      {isAdmin() && (
                        <Link href="/admin" onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gold-400 hover:text-gold-300 hover:bg-gold-500/5 transition-colors">
                          <Shield size={15} /> Admin Panel
                        </Link>
                      )}
                    </div>
                    <div className="border-t border-border py-2">
                      <button onClick={handleSignOut}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-ruby-400 hover:text-ruby-300 hover:bg-ruby-500/5 transition-colors">
                        <LogOut size={15} /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/auth/login" className="btn-ghost text-sm">Sign In</Link>
                <Link href="/auth/register" className="btn-gold text-sm py-2">Join Now</Link>
              </>
            )}
          </div>

          {/* Mobile menu */}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 text-gray-400 hover:text-white">
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {isOpen && (
        <div className="md:hidden bg-off-black border-b border-border px-4 pb-4 space-y-2">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setIsOpen(false)}
              className="block py-2.5 text-gray-400 hover:text-white border-b border-border/50">
              {link.label}
            </Link>
          ))}
          {user ? (
            <>
              <Link href="/dashboard" onClick={() => setIsOpen(false)} className="block py-2.5 text-gray-400 hover:text-white">Dashboard</Link>
              {isAdmin() && <Link href="/admin" onClick={() => setIsOpen(false)} className="block py-2.5 text-gold-400">Admin Panel</Link>}
              <button onClick={handleSignOut} className="block w-full text-left py-2.5 text-ruby-400">Sign Out</button>
            </>
          ) : (
            <div className="flex gap-3 pt-2">
              <Link href="/auth/login" onClick={() => setIsOpen(false)} className="btn-outline text-sm flex-1 justify-center">Sign In</Link>
              <Link href="/auth/register" onClick={() => setIsOpen(false)} className="btn-gold text-sm flex-1 justify-center">Join Now</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
