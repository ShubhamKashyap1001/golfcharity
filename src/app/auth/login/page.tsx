'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    const userId = data.user?.id;
    let role = 'subscriber';
    if (userId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .maybeSingle();
      if (profile?.role) role = profile.role;
    }

    toast.success('Welcome back!');
    router.push(role === 'admin' ? '/admin' : '/dashboard');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-hero-gradient pointer-events-none" />
      <div className="relative w-full max-w-md">
        <Link href="/" className="flex items-center gap-2 justify-center mb-8">
          <div className="w-8 h-8 rounded-full bg-gold-gradient flex items-center justify-center text-black font-bold text-sm">G</div>
          <span className="font-display text-xl font-semibold">Golf<span className="text-gold-500">Charity</span></span>
        </Link>

        <div className="card border-border">
          <h1 className="font-display text-3xl font-semibold text-white mb-2">Welcome back</h1>
          <p className="text-gray-400 text-sm mb-8">Sign in to your account to continue</p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="label">Email Address</label>
              <input type="email" className="input" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} className="input pr-12" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-gold w-full justify-center py-3.5 text-base">
              {loading ? 'Signing in…' : <>Sign In <ArrowRight size={16} /></>}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Don't have an account?{' '}
              <Link href="/auth/register" className="text-gold-400 hover:text-gold-300 font-medium">Create one</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}