import Link from 'next/link';
import { Heart, Search, ArrowRight } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { createSupabaseServerClient } from '@/lib/supabase.server';
import { formatCurrency } from '@/lib/utils';
import type { Charity } from '@/types';

export default async function CharitiesPage() {
  const supabase = createSupabaseServerClient();
  const { data: charities } = await supabase
    .from('charities')
    .select('*')
    .eq('is_active', true)
    .order('is_featured', { ascending: false })
    .order('total_raised', { ascending: false });

  const featured = (charities as Charity[] || []).find(c => c.is_featured);
  const rest = (charities as Charity[] || []).filter(c => !c.is_featured);
  const categories = [...new Set((charities as Charity[] || []).map(c => c.category).filter(Boolean))];

  return (
    <main className="min-h-screen bg-black">
      <Navbar />
      <div className="pt-24 pb-20">
        {/* Header */}
        <div className="max-w-7xl mx-auto px-4 mb-16 text-center">
          <span className="text-gold-400 text-sm font-medium uppercase tracking-widest">Making a Difference</span>
          <h1 className="font-display text-6xl md:text-7xl font-semibold text-white mt-3 mb-5">Choose Your Cause</h1>
          <p className="text-gray-400 text-xl max-w-2xl mx-auto">
            Every subscriber chooses a charity. At least 10% of every subscription goes directly to your chosen cause — automatically, every month.
          </p>
        </div>

        <div className="max-w-7xl mx-auto px-4">
          {/* Featured charity */}
          {featured && (
            <div className="relative rounded-3xl border border-gold-500/30 bg-dark-card overflow-hidden p-8 md:p-12 mb-12">
              <div className="absolute inset-0 bg-hero-gradient pointer-events-none" />
              <div className="relative flex flex-col md:flex-row gap-8 items-start">
                <div className="w-20 h-20 rounded-2xl bg-gold-500/20 border border-gold-500/30 flex items-center justify-center text-gold-400 font-display font-bold text-4xl shrink-0">
                  {featured.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h2 className="font-display text-3xl font-semibold text-white">{featured.name}</h2>
                    <span className="badge bg-gold-500/20 text-gold-400 border-gold-500/30 text-xs">★ Featured</span>
                    {featured.category && <span className="badge bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">{featured.category}</span>}
                  </div>
                  <p className="text-gray-300 leading-relaxed mb-5">{featured.description}</p>
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-xs text-gray-500">Total Raised by Members</p>
                      <p className="font-display text-2xl text-gold-400 font-bold">{formatCurrency(featured.total_raised * 100)}</p>
                    </div>
                    {featured.website_url && (
                      <a href={featured.website_url} target="_blank" rel="noopener noreferrer"
                        className="btn-outline text-sm py-2">Visit Website <ArrowRight size={13} /></a>
                    )}
                    <Link href="/auth/register" className="btn-gold text-sm py-2">
                      <Heart size={14} fill="currentColor" /> Support This Charity
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Category filters */}
          <div className="flex gap-2 flex-wrap mb-8">
            <span className="text-sm text-gray-400 mr-2 self-center">Filter:</span>
            {categories.map(cat => (
              <span key={cat} className="px-3 py-1.5 rounded-full border border-border text-xs text-gray-400 cursor-pointer hover:border-gold-500/50 hover:text-gold-400 transition-colors">
                {cat}
              </span>
            ))}
          </div>

          {/* Charity grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {rest.map(charity => (
              <div key={charity.id} className="card-hover flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-400 font-display font-bold text-xl shrink-0">
                    {charity.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{charity.name}</h3>
                    {charity.category && <span className="text-xs text-gray-500">{charity.category}</span>}
                  </div>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed flex-1">
                  {charity.short_description || charity.description.slice(0, 120) + '…'}
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div>
                    <p className="text-xs text-gray-500">Raised by members</p>
                    <p className="font-display text-lg text-gold-400 font-bold">{formatCurrency(charity.total_raised * 100)}</p>
                  </div>
                  <div className="flex gap-2">
                    {charity.website_url && (
                      <a href={charity.website_url} target="_blank" rel="noopener noreferrer"
                        className="btn-ghost text-xs py-1.5 px-3">Website</a>
                    )}
                    <Link href="/auth/register" className="btn-outline text-xs py-1.5 px-3 flex items-center gap-1">
                      <Heart size={12} /> Support
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-16 text-center">
            <p className="text-gray-400 mb-6">Ready to make a difference while playing golf?</p>
            <Link href="/auth/register" className="btn-gold text-base px-8 py-4 shadow-gold">
              Start Your Subscription <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}