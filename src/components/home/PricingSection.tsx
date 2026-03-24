'use client';
import Link from 'next/link';
import { Check } from 'lucide-react';

const features = [
  'Monthly prize draw entry',
  'Unlimited score logging',
  'Automatic charity contributions',
  'Winner verification support',
  'Full dashboard access',
  'Draw history & statistics',
];

export function PricingSection() {
  return (
    <section id="pricing" className="section bg-black">
      <div className="container">
        <div className="text-center mb-16">
          <span className="text-gold-400 text-sm font-medium uppercase tracking-widest">Simple Pricing</span>
          <h2 className="font-display text-5xl md:text-6xl font-semibold text-white mt-3 mb-4">One Subscription, Everything Included</h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">No hidden fees. A portion goes to prizes, a portion to charity, and the rest keeps the platform running.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Monthly */}
          <div className="card-hover flex flex-col gap-6">
            <div>
              <h3 className="font-display text-2xl font-semibold text-white">Monthly</h3>
              <div className="flex items-baseline gap-1 mt-3">
                <span className="font-display text-5xl font-bold text-white">£19</span>
                <span className="text-gray-400 text-lg">.99</span>
                <span className="text-gray-500 text-sm ml-1">/ month</span>
              </div>
            </div>
            <ul className="space-y-3 flex-1">
              {features.map(f => (
                <li key={f} className="flex items-center gap-3 text-sm text-gray-300">
                  <Check size={15} className="text-gold-400 shrink-0" />{f}
                </li>
              ))}
            </ul>
            <Link href="/auth/register?plan=monthly" className="btn-outline justify-center">Get Started Monthly</Link>
          </div>
          {/* Yearly */}
          <div className="relative card flex flex-col gap-6 border-gold-500/40 shadow-gold">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold-gradient text-black text-xs font-bold px-4 py-1.5 rounded-full">
              BEST VALUE — Save £40
            </div>
            <div>
              <h3 className="font-display text-2xl font-semibold text-white">Yearly</h3>
              <div className="flex items-baseline gap-1 mt-3">
                <span className="font-display text-5xl font-bold text-gold-400">£199</span>
                <span className="text-gold-600 text-lg">.99</span>
                <span className="text-gray-500 text-sm ml-1">/ year</span>
              </div>
              <p className="text-xs text-emerald-400 mt-1.5">Equivalent to £16.67/month</p>
            </div>
            <ul className="space-y-3 flex-1">
              {features.map(f => (
                <li key={f} className="flex items-center gap-3 text-sm text-gray-300">
                  <Check size={15} className="text-gold-400 shrink-0" />{f}
                </li>
              ))}
              <li className="flex items-center gap-3 text-sm text-gold-300 font-medium">
                <Check size={15} className="text-gold-400 shrink-0" />Priority winner verification
              </li>
            </ul>
            <Link href="/auth/register?plan=yearly" className="btn-gold justify-center shadow-gold">Get Started Yearly</Link>
          </div>
        </div>
        {/* Breakdown */}
        <div className="mt-12 p-6 rounded-2xl border border-border bg-dark-card/50 max-w-2xl mx-auto">
          <h4 className="text-center text-sm font-medium text-gray-400 mb-4 uppercase tracking-wider">How Your Subscription Is Used</h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[['60%', 'Prize Pool', 'text-gold-400'], ['10%+', 'Charity', 'text-emerald-400'], ['30%', 'Platform', 'text-gray-400']].map(([pct, label, color]) => (
              <div key={label}>
                <div className={`font-display text-3xl font-bold ${color}`}>{pct}</div>
                <div className="text-xs text-gray-500 mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
