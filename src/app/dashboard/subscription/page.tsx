'use client';

import { useState } from 'react';
import { CreditCard, Shield, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { formatCurrency, formatDate, getStatusBadge, cn } from '@/lib/utils';
import { PLANS } from '@/lib/stripe';
import toast from 'react-hot-toast';

export default function SubscriptionPage() {
  const { user, subscription } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async (plan: 'monthly' | 'yearly') => {
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, email: user?.email }),
      });
      const { url, error } = await res.json();
      if (error) throw new Error(error);
      if (url) window.location.href = url;
    } catch (err: any) {
      toast.error(err.message || 'Failed to start checkout');
    }
    setLoading(false);
  };

  const handleCancel = async () => {
    if (!confirm('Cancel your subscription? You will retain access until the end of your current period.')) return;
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/cancel', { method: 'POST' });
      const { error } = await res.json();
      if (error) throw new Error(error);
      toast.success('Subscription cancelled. Access continues until period end.');
    } catch (err: any) {
      toast.error(err.message || 'Cancellation failed');
    }
    setLoading(false);
  };

  const handlePortal = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const { url, error } = await res.json();
      if (error) throw new Error(error);
      if (url) window.location.href = url;
    } catch (err: any) {
      toast.error(err.message || 'Failed to open billing portal');
    }
    setLoading(false);
  };

  const isActive = subscription?.status === 'active';

  return (
    <div className="space-y-8">
      <div className="page-header">
        <h1 className="page-title">Subscription</h1>
        <p className="page-subtitle">Manage your plan and billing details.</p>
      </div>

      {/* Current subscription */}
      {subscription ? (
        <div className={cn('card', isActive ? 'border-gold-500/30' : 'border-ruby-500/30')}>
          <div className="flex items-start gap-4">
            <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', isActive ? 'bg-gold-500/10' : 'bg-ruby-500/10')}>
              {isActive ? <CheckCircle size={22} className="text-gold-400" /> : <AlertCircle size={22} className="text-ruby-400" />}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="font-display text-xl font-semibold text-white capitalize">{subscription.plan} Plan</h2>
                <span className={cn('badge', getStatusBadge(subscription.status))}>{subscription.status}</span>
                {subscription.cancel_at_period_end && (
                  <span className="badge bg-amber-500/20 text-amber-400 border-amber-500/30">Cancels at period end</span>
                )}
              </div>
              <p className="text-gray-400 text-sm">
                {formatCurrency(subscription.amount_pence)} / {subscription.plan === 'monthly' ? 'month' : 'year'}
              </p>
              {subscription.current_period_end && (
                <p className="text-xs text-gray-500 mt-1">
                  {isActive ? 'Renews' : 'Access ends'}: {formatDate(subscription.current_period_end)}
                </p>
              )}
            </div>
          </div>
          {isActive && (
            <div className="flex gap-3 mt-6">
              <button onClick={handlePortal} disabled={loading} className="btn-outline text-sm">
                <CreditCard size={15} /> Manage Billing
              </button>
              {!subscription.cancel_at_period_end && (
                <button onClick={handleCancel} disabled={loading} className="btn-ghost text-sm text-ruby-400 hover:text-ruby-300">
                  Cancel Subscription
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="card text-center py-8 border-amber-500/20">
          <AlertCircle size={32} className="text-amber-400 mx-auto mb-3" />
          <p className="text-white font-medium mb-1">No active subscription</p>
          <p className="text-gray-400 text-sm">Subscribe to enter draws and support charities.</p>
        </div>
      )}

      {/* Plan options */}
      {!isActive && (
        <>
          <h2 className="font-display text-2xl font-semibold text-white">Choose a Plan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(['monthly', 'yearly'] as const).map(plan => {
              const planInfo = PLANS[plan];
              const isBest = plan === 'yearly';
              return (
                <div key={plan} className={cn('card flex flex-col gap-6', isBest && 'border-gold-500/40 shadow-gold relative')}>
                  {isBest && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold-gradient text-black text-xs font-bold px-4 py-1.5 rounded-full">
                      BEST VALUE — Save £40
                    </div>
                  )}
                  <div>
                    <h3 className="font-display text-2xl font-semibold text-white capitalize">{plan}</h3>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className={cn('font-display text-4xl font-bold', isBest ? 'text-gold-400' : 'text-white')}>
                        {plan === 'monthly' ? '£19' : '£199'}
                      </span>
                      <span className="text-gray-400">.{plan === 'monthly' ? '99' : '99'}</span>
                      <span className="text-gray-500 text-sm">/ {plan === 'monthly' ? 'month' : 'year'}</span>
                    </div>
                    {isBest && <p className="text-xs text-emerald-400 mt-1">Equivalent to £16.67/month</p>}
                  </div>
                  <ul className="space-y-2.5 flex-1 text-sm">
                    {['Monthly prize draw entry', 'Unlimited score logging', 'Automatic charity contributions', 'Full dashboard access'].map(f => (
                      <li key={f} className="flex items-center gap-2.5 text-gray-300">
                        <CheckCircle size={14} className="text-gold-400 shrink-0" />{f}
                      </li>
                    ))}
                  </ul>
                  <button onClick={() => handleCheckout(plan)} disabled={loading}
                    className={cn('w-full justify-center', isBest ? 'btn-gold' : 'btn-outline')}>
                    {loading ? 'Loading…' : <>Get Started <ArrowRight size={15} /></>}
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Security note */}
      <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-dark">
        <Shield size={16} className="text-gray-500 shrink-0" />
        <p className="text-xs text-gray-500">
          Payments are processed securely by Stripe. We never store card details. All transactions are PCI-DSS compliant.
        </p>
      </div>
    </div>
  );
}
