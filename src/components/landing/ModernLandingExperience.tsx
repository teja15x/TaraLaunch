'use client';

import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { PricingSection } from '@/components/landing/PricingSection';
import ModernNavbar from '@/components/landing/ModernNavbar';
import ModernFooter from '@/components/landing/ModernFooter';
import CTASection from '@/components/landing/CTASection';

export function ModernLandingExperience() {
  return (
    <div className="bg-slate-950 min-h-screen overflow-hidden">
      <ModernNavbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <PricingSection />
      <CTASection />
      <ModernFooter />
    </div>
  );
}
