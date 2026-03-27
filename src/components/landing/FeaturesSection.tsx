'use client';

import { motion } from 'framer-motion';
import { Zap, Brain, Users, TrendingUp, Gamepad2, Bot } from 'lucide-react';
import { Card } from '@/components/ui/Card';

const features = [
  {
    icon: Gamepad2,
    title: '5 Career Games',
    description: 'Not quizzes. Real games that build skills while you play. Pattern Master, Scenario Quest, Story Weaver, and more.',
    color: 'from-primary-600/20 to-primary-600/5',
    iconColor: 'text-primary-400',
  },
  {
    icon: Brain,
    title: 'AI Counselor (24/7)',
    description: 'Chat with an AI that understands entrance exams, parent pressure, and real Indian career paths. No session fees.',
    color: 'from-accent-600/20 to-accent-600/5',
    iconColor: 'text-accent-400',
  },
  {
    icon: TrendingUp,
    title: 'Real Career Matches',
    description: 'Not generic. Based on your skills, interests, and India-first context. From IIT passing to startup founder.',
    color: 'from-emerald-600/20 to-emerald-600/5',
    iconColor: 'text-emerald-400',
  },
  {
    icon: Zap,
    title: 'Confidence-Based Unlocks',
    description: 'Play more games → Build confidence → Unlock better insights. Gamified learning that actually works.',
    color: 'from-orange-600/20 to-orange-600/5',
    iconColor: 'text-orange-400',
  },
  {
    icon: Users,
    title: 'Parent Co-Pilot',
    description: 'Share your journey with parents. Help them understand why you chose this path. Reduces pressure, increases support.',
    color: 'from-pink-600/20 to-pink-600/5',
    iconColor: 'text-pink-400',
  },
  {
    icon: Bot,
    title: 'Adaptive Routing',
    description: 'The agent learns. Every game you play, every choice you make refines your next recommendation.',
    color: 'from-purple-600/20 to-purple-600/5',
    iconColor: 'text-purple-400',
  },
];

export function FeaturesSection() {
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
            <span className="text-sm text-white/70">What Makes Us Different</span>
          </div>

          <h2 className="text-4xl lg:text-5xl font-black text-white">
            Career Navigation
            <br />
            <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
              Built for India
            </span>
          </h2>

          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            No copying US career advice. No outdated counselor guidance. Built by Indians, for Indian students navigating
            JEE/NEET, parent pressure, and real opportunities.
          </p>
        </motion.div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className={`bg-gradient-to-br ${feature.color} border-white/10 p-8 h-full hover:border-white/20 transition-all group cursor-pointer`}>
                <div className={`inline-flex p-3 rounded-lg bg-white/10 mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon size={24} className={`${feature.iconColor}`} />
                </div>

                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-white/70 leading-relaxed">{feature.description}</p>

                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-xs text-white/50">Learn more →</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
