'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, ArrowRight, Check, Shield, ChevronDown } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

// Admin secret code — in production, store this in an env variable
// Set NEXT_PUBLIC_ADMIN_CODE in your .env.local (e.g. NEXT_PUBLIC_ADMIN_CODE=DIGI2026)
const ADMIN_SECRET_CODE = process.env.NEXT_PUBLIC_ADMIN_CODE || 'DIGITALHEROES2026';

function RegisterForm() {
  const params = useSearchParams();
  const defaultPlan = (params.get('plan') as 'monthly' | 'yearly') || 'monthly';

  const [plan, setPlan] = useState<'monthly' | 'yearly'>(defaultPlan);
  const [form, setForm] = useState({ full_name: '', email: '', password: '', adminCode: '' });
  const [showPass, setShowPass] = useState(false);
  const [showAdminSection, setShowAdminSection] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAdminCodeCheck = () => {
    if (form.adminCode === ADMIN_SECRET_CODE) {
      setIsAdminMode(true);
      toast.success('Admin code verified ✓');
    } else {
      toast.error('Invalid admin code');
      setForm(f => ({ ...f, adminCode: '' }));
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name.trim()) { toast.error('Full name is required'); return; }
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return; }

    const role = isAdminMode ? 'admin' : 'subscriber';
    setLoading(true);
    const supabase = createSupabaseBrowserClient();

    // 1. Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.full_name, role },
      },
    });

    if (authError) {
      toast.error(authError.message);
      setLoading(false);
      return;
    }

    if (!authData.user) {
      toast.error('Signup failed — please try again.');
      setLoading(false);
      return;
    }

    // 2. Manually upsert profile (backup in case DB trigger is delayed)
    await supabase.from('profiles').upsert({
      id: authData.user.id,
      email: form.email,
      full_name: form.full_name,
      role,
    }, { onConflict: 'id' });

    // 3. Admin → no payment needed, go straight to admin panel
    if (role === 'admin') {
      toast.success('Admin account created! Redirecting…');
      router.push('/admin');
      setLoading(false);
      return;
    }

    // 4. Subscriber → Stripe checkout
    toast.success('Account created! Redirecting to payment…');
    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, email: form.email }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        // Stripe not configured / no price IDs yet
        toast('Stripe not configured — going to dashboard', { icon: 'ℹ️' });
        router.push('/dashboard');
      }
    } catch {
      router.push('/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 bg-hero-gradient pointer-events-none" />
      <div className="relative w-full max-w-lg">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 justify-center mb-8">
          <div className="w-8 h-8 rounded-full bg-gold-gradient flex items-center justify-center text-black font-bold text-sm">G</div>
          <span className="font-display text-xl font-semibold">Golf<span className="text-gold-500">Charity</span></span>
        </Link>

        <div className="card border-border">
          <h1 className="font-display text-3xl font-semibold text-white mb-1">Create Your Account</h1>
          <p className="text-gray-400 text-sm mb-6">Join and start making an impact today</p>

          {/* Admin verified banner */}
          {isAdminMode && (
            <div className="flex items-center gap-3 p-4 rounded-xl border border-gold-500/30 bg-gold-500/5 mb-6">
              <Shield size={18} className="text-gold-400 shrink-0" />
              <div>
                <p className="text-sm font-medium text-gold-400">Admin Mode Active</p>
                <p className="text-xs text-gray-500">No payment required. Full platform control after signup.</p>
              </div>
            </div>
          )}

          {/* Plan selection — only for normal subscribers */}
          {!isAdminMode && (
            <div className="mb-6">
              <label className="label">Choose Your Plan</label>
              <div className="grid grid-cols-2 gap-3">
                {([
                  ['monthly', '£19.99/mo', ''] as const,
                  ['yearly', '£199.99/yr', 'Save £40'] as const,
                ]).map(([p, price, tag]) => (
                  <button key={p} type="button" onClick={() => setPlan(p)}
                    className={cn(
                      'p-4 rounded-xl border text-left transition-all',
                      plan === p ? 'border-gold-500 bg-gold-500/10' : 'border-border hover:border-border-light'
                    )}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-white capitalize">{p}</span>
                      {plan === p && <Check size={14} className="text-gold-400" />}
                    </div>
                    <div className="text-gold-400 font-display font-bold">{price}</div>
                    {tag && <div className="text-xs text-emerald-400 mt-0.5">{tag}</div>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input
                type="text" className="input" placeholder="John Smith"
                value={form.full_name}
                onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="label">Email Address</label>
              <input
                type="email" className="input" placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'} className="input pr-12"
                  placeholder="Min. 8 characters" minLength={8}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn-gold w-full justify-center py-3.5 text-base mt-2">
              {loading ? 'Creating account…' : (
                isAdminMode
                  ? <><Shield size={16} /> Create Admin Account</>
                  : <>Continue to Payment <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p className="text-xs text-gray-600 text-center mt-4">
            By creating an account you agree to our Terms of Service and Privacy Policy
          </p>

          <div className="mt-5 text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-gold-400 hover:text-gold-300 font-medium">Sign in</Link>
            </p>
          </div>

          {/* Admin secret code section — collapsed by default */}
          {!isAdminMode && (
            <div className="mt-6 border-t border-border pt-5">
              <button
                type="button"
                onClick={() => setShowAdminSection(!showAdminSection)}
                className="flex items-center gap-2 text-xs text-gray-600 hover:text-gray-400 transition-colors mx-auto"
              >
                <Shield size={12} />
                Admin access
                <ChevronDown size={12} className={cn('transition-transform', showAdminSection && 'rotate-180')} />
              </button>

              {showAdminSection && (
                <div className="mt-4 space-y-3">
                  <p className="text-xs text-gray-500 text-center">
                    Enter the administrator secret code provided by Digital Heroes
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      className="input flex-1 text-sm"
                      placeholder="Admin secret code"
                      value={form.adminCode}
                      onChange={e => setForm(f => ({ ...f, adminCode: e.target.value }))}
                      onKeyDown={e => e.key === 'Enter' && handleAdminCodeCheck()}
                    />
                    <button
                      type="button"
                      onClick={handleAdminCodeCheck}
                      className="btn-outline text-sm px-4"
                    >
                      Verify
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}