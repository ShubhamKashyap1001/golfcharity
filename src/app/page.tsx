import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/home/HeroSection';
import { HowItWorksSection } from '@/components/home/HowItWorksSection';
import { DrawSection } from '@/components/home/DrawSection';
import { CharitySection } from '@/components/home/CharitySection';
import { PricingSection } from '@/components/home/PricingSection';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';
import { CtaSection } from '@/components/home/CtaSection';
import { createSupabaseServerClient } from '@/lib/supabase.server';
import type { Charity, Draw } from '@/types';

export default async function HomePage() {
  const supabase = createSupabaseServerClient();

  const [{ data: charities }, { data: latestDraw }] = await Promise.all([
    supabase.from('charities').select('*').eq('is_active', true).order('is_featured', { ascending: false }).limit(6),
    supabase.from('draws').select('*').eq('status', 'published').order('draw_year', { ascending: false }).order('draw_month', { ascending: false }).limit(1).single(),
  ]);

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <HeroSection />
      <HowItWorksSection />
      <DrawSection draw={latestDraw as Draw | null} />
      <CharitySection charities={(charities as Charity[]) || []} />
      <PricingSection />
      <TestimonialsSection />
      <CtaSection />
      <Footer />
    </div>
  );
}