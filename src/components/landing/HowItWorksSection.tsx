'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';

const steps = [
  {
    number: '01',
    title: 'Take the First Game',
    description: 'Start with Pattern Master. 8 minutes. No exam pressure, just fun skill-building.',
    highlight: 'Your streak begins here',
  },
  {
    number: '02',
    title: 'Chat & Get Insight',
    description: 'Talk to AI about what you are thinking. Parent pressure? Stream confusion? We get it.',
    highlight: 'Understanding comes first',
  },
  {
    number: '03',
    title: 'Unlock Matches',
    description: 'As your confidence grows (by playing more games), career matches reveal themselves.',
    highlight: '50% confidence = basic paths',
  },
  {
    number: '04',
    title: 'Build Your Roadmap',
    description: 'Science, Law, Tech, Medicine, or something custom? Get a month-by-month action plan.',
    highlight: 'Action > Confusion',
  },
  {
    number: '05',
    title: 'Share with Parents',
    description: 'Show them your choice is backed by data and self-reflection. Reduces pushback (seriously).',
    highlight: 'Alignment = support',
  },
  {
    number: '06',
    title: 'Execute & Adapt',
    description: 'Follow the plan. Check in with AI counselor monthly. Change direction if needed.',
    highlight: 'Flexibility built-in',
  },
];

export function HowItWorksSection() {
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
            <span className="w-2 h-2 rounded-full bg-primary-400" />
            <span className="text-sm text-white/70">Your 7-Day Path to Clarity</span>
          </div>

          <h2 className="text-4xl lg:text-5xl font-black text-white">
            How Career Agent
            <br />
            Works for You
          </h2>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {steps.map((step, idx) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              viewport={{ once: true }}
            >
              <Card className="bg-gradient-to-br from-white/10 to-white/5 border-white/10 p-8 h-full hover:border-white/20 transition-all">
                <div className="text-4xl font-black text-primary-400 mb-4 opacity-60">{step.number}</div>
                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-white/70 leading-relaxed mb-4">{step.description}</p>
                <div className="pt-4 border-t border-white/10">
                  <p className="text-sm text-primary-300 font-medium">{step.highlight}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-white/70 mb-6 text-lg">First 100 students get lifetime free access to Parent Co-Pilot</p>
          <a href="/chat" className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 text-white font-semibold rounded-lg transition-all">
            Start Now (Free)
            <span className="ml-2">→</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
