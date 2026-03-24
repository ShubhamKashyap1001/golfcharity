'use client';
import Link from 'next/link';
import { Heart, ArrowRight, ExternalLink } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { Charity } from '@/types';

export function CharitySection({ charities }: { charities: Charity[] }) {
  return (
    <section className="section bg-off-black">
      <div className="container">
        <div className="text-center mb-16">
          <span className="text-gold-400 text-sm font-medium uppercase tracking-widest">Giving Back</span>
          <h2 className="font-display text-5xl md:text-6xl font-semibold text-white mt-3 mb-4">You Choose the Charity</h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">At least 10% of every subscription goes directly to your chosen charity. No admin. No delays. Automatic.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {charities.map(charity => (
            <div key={charity.id} className="card-hover group flex flex-col gap-4">
              {charity.is_featured && (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gold-400 bg-gold-500/10 border border-gold-500/20 rounded-full px-3 py-1 self-start">
                  ★ Featured Charity
                </span>
              )}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-400 text-lg font-bold font-display">
                  {charity.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">{charity.name}</h3>
                  {charity.category && <span className="text-xs text-gray-500">{charity.category}</span>}
                </div>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed flex-1">{charity.short_description || charity.description.slice(0, 100) + '...'}</p>
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div>
                  <p className="text-xs text-gray-500">Total Raised</p>
                  <p className="font-display text-lg text-gold-400 font-semibold">{formatCurrency(charity.total_raised * 100)}</p>
                </div>
                <Heart size={18} className="text-gold-400/40 group-hover:text-gold-400 transition-colors fill-current" />
              </div>
            </div>
          ))}
        </div>
        <div className="text-center">
          <Link href="/charities" className="btn-outline inline-flex items-center gap-2">
            View All Charities <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
