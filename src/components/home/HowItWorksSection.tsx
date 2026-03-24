'use client';
import { CreditCard, Target, Ticket, Heart, ArrowRight } from 'lucide-react';

const steps = [
  { icon: CreditCard, step: '01', title: 'Subscribe', description: 'Choose monthly or yearly. A portion of every payment automatically funds your chosen charity.' },
  { icon: Target, step: '02', title: 'Log Your Scores', description: 'Enter your Stableford scores after each round. Your five most recent scores are always on record.' },
  { icon: Ticket, step: '03', title: 'Enter the Draw', description: 'Your scores generate your monthly draw numbers. Matched 3, 4, or all 5 — and you win.' },
  { icon: Heart, step: '04', title: 'Make an Impact', description: 'At least 10% of your subscription goes directly to your chosen charity, automatically, every month.' },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="section bg-off-black">
      <div className="container">
        <div className="text-center mb-16">
          <span className="text-gold-400 text-sm font-medium uppercase tracking-widest">The Platform</span>
          <h2 className="font-display text-5xl md:text-6xl font-semibold text-white mt-3 mb-4">How It Works</h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">Four simple steps from signup to charity impact — and you might just win along the way.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <div key={step.step} className="relative group">
              <div className="card-hover h-full">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-400 group-hover:bg-gold-500/20 transition-colors">
                    <step.icon size={22} />
                  </div>
                  <span className="font-display text-5xl font-bold text-white/5 group-hover:text-white/10 transition-colors select-none">{step.step}</span>
                </div>
                <h3 className="font-display text-2xl font-semibold text-white mb-3">{step.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
              </div>
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 -translate-y-1/2 z-10">
                  <ArrowRight size={16} className="text-border-light" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
