'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Card } from '@/components/ui/Card';

const plans = [
  {
    name: 'Student (Free)',
    price: '₹0',
    period: 'Forever',
    description: 'Perfect for exploring',
    features: [
      'First 3 games',
      'Basic career matches',
      'AI chat (limited)',
      '7-day streak tracking',
      'Mobile app access',
    ],
    cta: 'Start Free',
    highlighted: false,
  },
  {
    name: 'Student Plus',
    price: '₹499',
    period: '/month',
    description: 'For serious planning',
    features: [
      'All 5 games + new ones monthly',
      'Full career roadmap',
      'Unlimited AI chat',
      'Monthly progress reviews',
      'Parent co-pilot access',
      'College pathway guidance',
      'Exam prep tips',
    ],
    cta: 'Choose Plan',
    highlighted: true,
  },
  {
    name: 'Parent (Beta)',
    price: '₹99',
    period: '/month',
    description: 'Limited launch',
    features: [
      'Track child\'s journey',
      'See career insights',
      'Get recommendations on support',
      'Chat history access',
      'Progress reports monthly',
      'Parent peer group',
    ],
    cta: 'Join Beta',
    highlighted: false,
  },
];

export function PricingSection() {
  return (
    <section className="py-24 px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16 space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm w-fit mx-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-sm text-white/70">Simple, No Hidden Fees</span>
          </div>

          <h2 className="text-4xl lg:text-5xl font-black text-white">
            Choose Your
            <br />
            <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
              Plan
            </span>
          </h2>

          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Free to explore. Affordable to commit. No session fees. No hidden costs.
          </p>
        </motion.div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan, idx) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              viewport={{ once: true }}
              className={plan.highlighted ? 'md:scale-105' : ''}
            >
              <Card
                className={`relative h-full p-8 transition-all ${
                  plan.highlighted
                    ? 'bg-gradient-to-br from-primary-600/20 to-accent-600/10 border-primary-500/50'
                    : 'bg-gradient-to-br from-white/10 to-white/5 border-white/10'
                } hover:border-white/20`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-primary-500 to-accent-500 text-white text-xs font-bold rounded-full">
                    MOST POPULAR
                  </div>
                )}

                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-white/60 text-sm mb-6">{plan.description}</p>

                {/* Price */}
                <div className="mb-8">
                  <span className="text-4xl font-black text-white">{plan.price}</span>
                  <span className="text-white/60 ml-2">{plan.period}</span>
                </div>

                {/* Features */}
                <div className="space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <Check size={18} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span className="text-white/80 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <button
                  className={`w-full py-3 rounded-lg font-semibold transition-all ${
                    plan.highlighted
                      ? 'bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 text-white'
                      : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                  }`}
                >
                  {plan.cta}
                </button>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Subtext */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-white/60 text-sm">
            🎓 Students from low-income backgrounds: Free Plus access. Apply at www.carreeragent.ai/scholarship
          </p>
        </motion.div>
      </div>
    </section>
  );
}
