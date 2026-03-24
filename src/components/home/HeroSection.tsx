'use client';
import Link from 'next/link';
import { ArrowRight, Heart, Trophy, TrendingUp } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-hero-gradient pointer-events-none" />
      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
      {/* Gold orb */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-gold-500/10 blur-[120px] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 text-center pt-24 pb-16">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gold-500/30 bg-gold-500/10 text-gold-400 text-sm font-medium mb-8 animate-fade-in">
          <Heart size={14} className="fill-gold-400" />
          Every subscription supports real charity
        </div>

        {/* Headline */}
        <h1 className="font-display text-6xl md:text-8xl font-semibold text-white leading-[0.95] mb-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
          Play Golf.<br />
          <span className="text-gold-gradient">Win Big.</span><br />
          Give More.
        </h1>

        {/* Subheadline */}
        <p className="text-gray-400 text-xl md:text-2xl max-w-2xl mx-auto mb-10 animate-fade-up leading-relaxed" style={{ animationDelay: '0.2s' }}>
          The subscription platform where your Stableford scores enter you into monthly prize draws — while automatically funding the charities you love.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-up" style={{ animationDelay: '0.3s' }}>
          <Link href="/auth/register" className="btn-gold text-base px-8 py-4 shadow-gold animate-glow-pulse">
            Start Your Subscription <ArrowRight size={18} />
          </Link>
          <Link href="/#how-it-works" className="btn-outline text-base px-8 py-4">
            See How It Works
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: '0.4s' }}>
          {[
            { icon: Trophy, value: '£24,000+', label: 'Prize Pool This Year' },
            { icon: Heart, value: '6 Charities', label: 'Supported Monthly' },
            { icon: TrendingUp, value: '2,000+', label: 'Active Subscribers' },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className="p-5 rounded-xl border border-border bg-dark-card/50 backdrop-blur-sm">
              <Icon size={20} className="text-gold-400 mx-auto mb-2" />
              <div className="font-display text-2xl font-semibold text-white">{value}</div>
              <div className="text-xs text-gray-500 mt-1">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-float">
        <span className="text-xs text-gray-600">Scroll to explore</span>
        <div className="w-px h-8 bg-gradient-to-b from-gold-500/50 to-transparent" />
      </div>
    </section>
  );
}
