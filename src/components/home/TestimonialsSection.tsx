'use client';
import Link from 'next/link';
import { ArrowRight, Star } from 'lucide-react';

const testimonials = [
  { name: 'James T.', location: 'Manchester', quote: 'I won £340 in the March draw and my chosen charity received their cut automatically. Incredible concept.', rating: 5 },
  { name: 'Sarah P.', location: 'Edinburgh', quote: 'Never thought golf could be this rewarding off the course. The charity side of it is what sold me.', rating: 5 },
  { name: 'Mike R.', location: 'London', quote: 'The score tracking is seamless and the draw is genuinely exciting each month. Worth every penny.', rating: 5 },
];

export function TestimonialsSection() {
  return (
    <section className="section bg-off-black">
      <div className="container">
        <div className="text-center mb-16">
          <span className="text-gold-400 text-sm font-medium uppercase tracking-widest">Members Say</span>
          <h2 className="font-display text-5xl md:text-6xl font-semibold text-white mt-3">Real Golfers. Real Impact.</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map(t => (
            <div key={t.name} className="card-hover flex flex-col gap-5">
              <div className="flex gap-1">
                {Array(t.rating).fill(0).map((_, i) => <Star key={i} size={14} className="text-gold-400 fill-gold-400" />)}
              </div>
              <p className="text-gray-300 text-sm leading-relaxed italic flex-1">"{t.quote}"</p>
              <div>
                <p className="text-white font-medium text-sm">{t.name}</p>
                <p className="text-gray-500 text-xs">{t.location}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CtaSection() {
  return (
    <section className="section bg-black">
      <div className="container">
        <div className="relative rounded-3xl border border-gold-500/20 bg-dark-card overflow-hidden p-12 md:p-20 text-center">
          <div className="absolute inset-0 bg-hero-gradient pointer-events-none" />
          <div className="relative">
            <h2 className="font-display text-5xl md:text-7xl font-semibold text-white mb-6">Ready to Make Every Round Count?</h2>
            <p className="text-gray-400 text-xl max-w-xl mx-auto mb-10">Join thousands of golfers who are winning prizes and funding charities — one Stableford score at a time.</p>
            <Link href="/auth/register" className="btn-gold text-lg px-10 py-5 shadow-gold-lg animate-glow-pulse inline-flex items-center gap-3">
              Start Your Journey <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
