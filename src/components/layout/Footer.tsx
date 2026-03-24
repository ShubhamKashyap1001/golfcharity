'use client';
import Link from 'next/link';
import { Heart, Twitter, Instagram, Youtube } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-off-black border-t border-border mt-20">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-gold-gradient flex items-center justify-center text-black font-bold text-sm shadow-gold">G</div>
              <span className="font-display text-xl font-semibold">Golf<span className="text-gold-500">Charity</span></span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">Where every swing makes a difference. Play, win, and give back.</p>
            <div className="flex gap-3 mt-5">
              {[Twitter, Instagram, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-gray-500 hover:text-gold-400 hover:border-gold-500/50 transition-colors">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>
          {/* Platform */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Platform</h4>
            <ul className="space-y-2.5">
              {[['How It Works','/#how-it-works'],['Prize Draws','/#draws'],['Charities','/charities'],['Pricing','/#pricing']].map(([l,h])=>(
                <li key={l}><Link href={h} className="text-sm text-gray-500 hover:text-white transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>
          {/* Account */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Account</h4>
            <ul className="space-y-2.5">
              {[['Sign Up','/auth/register'],['Sign In','/auth/login'],['Dashboard','/dashboard'],['My Scores','/dashboard/scores']].map(([l,h])=>(
                <li key={l}><Link href={h} className="text-sm text-gray-500 hover:text-white transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>
          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Legal</h4>
            <ul className="space-y-2.5">
              {[['Privacy Policy','#'],['Terms of Service','#'],['Cookie Policy','#'],['About Us','/about']].map(([l,h])=>(
                <li key={l}><Link href={h} className="text-sm text-gray-500 hover:text-white transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">© {new Date().getFullYear()} GolfCharity. All rights reserved. Built by Digital Heroes.</p>
          <p className="text-xs text-gray-600 flex items-center gap-1.5">Made with <Heart size={12} className="text-gold-500" /> for charity</p>
        </div>
      </div>
    </footer>
  );
}
