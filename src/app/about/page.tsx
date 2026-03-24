import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Heart, Trophy, Target, Users, ArrowRight, Youtube } from 'lucide-react';

export default function AboutPage() {
  const stats = [
    { value: '2,000+', label: 'Brands Worked With' },
    { value: '£10M+', label: 'Revenue Generated' },
    { value: '2.5M+', label: 'YouTube Subscribers' },
    { value: '2016', label: 'Founded' },
  ];

  const values = [
    { icon: Heart, title: 'Charity First', desc: 'We built this platform with charity as the primary purpose, not a side feature. Golf is the vehicle. Impact is the destination.' },
    { icon: Trophy, title: 'Fair Rewards', desc: 'Our draw system is transparent, configurable, and designed to ensure every subscriber has a genuine chance to win.' },
    { icon: Target, title: 'Your Game, Your Way', desc: 'Track what matters — your Stableford scores. Simple, clean, and always up to date with a rolling 5-score system.' },
    { icon: Users, title: 'Community Impact', desc: 'When thousands of golfers each contribute just 10% of their subscription, the collective impact on charities is extraordinary.' },
  ];

  return (
    <main className="min-h-screen bg-black">
      <Navbar />
      <div className="pt-24">
        {/* Hero */}
        <section className="section">
          <div className="max-w-4xl mx-auto text-center">
            <span className="text-gold-400 text-sm font-medium uppercase tracking-widest">Our Story</span>
            <h1 className="font-display text-6xl md:text-7xl font-semibold text-white mt-4 mb-6">
              Golf That Gives Back
            </h1>
            <p className="text-gray-300 text-xl leading-relaxed">
              We believe golf should be more than a hobby. It should be a force for good. Golf Charity was built on one simple idea: what if every time you picked up a club, you helped someone who needed it?
            </p>
          </div>
        </section>

        {/* Mission */}
        <section className="section bg-off-black">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="font-display text-5xl font-semibold text-white mb-6">Why We Built This</h2>
                <div className="space-y-4 text-gray-400 leading-relaxed">
                  <p>Golf has always been a social game — bringing communities together, building relationships, fostering friendly competition. But we wanted to take that community spirit further.</p>
                  <p>Golf Charity connects three things that shouldn't exist separately: the competitive thrill of a monthly prize draw, the personal satisfaction of tracking your golf improvement, and the profound purpose of contributing to charity.</p>
                  <p>Every month, your subscription does three things at once: it enters you into a draw for real cash prizes, it logs your scores, and it funds a cause you care about.</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {values.map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="card-hover p-5">
                    <Icon size={22} className="text-gold-400 mb-3" />
                    <h3 className="font-display text-lg font-semibold text-white mb-2">{title}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Digital Heroes */}
        <section className="section">
          <div className="max-w-7xl mx-auto px-4">
            <div className="relative rounded-3xl border border-border bg-dark-card p-10 md:p-16 overflow-hidden">
              <div className="absolute inset-0 bg-hero-gradient pointer-events-none" />
              <div className="relative">
                <span className="text-gold-400 text-sm font-medium uppercase tracking-widest">Built By</span>
                <h2 className="font-display text-4xl md:text-5xl font-semibold text-white mt-3 mb-6">Digital Heroes</h2>
                <p className="text-gray-300 text-lg mb-8 max-w-2xl leading-relaxed">
                  Digital Heroes is a full-stack development and digital marketing agency, founded by Shreyansh Singh. Since 2016, they've worked with 2,000+ brands, generated over $10M in sales, and built a YouTube community of 2.5M+ subscribers.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
                  {stats.map(({ value, label }) => (
                    <div key={label} className="text-center p-4 rounded-xl border border-border bg-black/30">
                      <p className="font-display text-3xl font-bold text-gold-400">{value}</p>
                      <p className="text-xs text-gray-500 mt-1">{label}</p>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-3">
                  <a href="https://digitalheroes.co.in" target="_blank" rel="noopener noreferrer" className="btn-gold text-sm">
                    Visit Digital Heroes <ArrowRight size={14} />
                  </a>
                  <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="btn-outline text-sm flex items-center gap-2">
                    <Youtube size={15} /> YouTube Channel
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section bg-off-black">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-5xl font-semibold text-white mb-6">Ready to Join?</h2>
            <p className="text-gray-400 text-lg mb-10">Start your subscription today and make every round count for good.</p>
            <Link href="/auth/register" className="btn-gold text-lg px-10 py-5 shadow-gold-lg inline-flex items-center gap-3">
              <Heart size={18} fill="currentColor" /> Start Your Subscription
            </Link>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
}
