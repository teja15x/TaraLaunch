'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { Card } from '@/components/ui/Card';

const testimonials = [
  {
    initials: 'AP',
    name: 'Arjun Patel',
    role: 'Chose CS over Medicine • IIT Bombay 2025',
    quote: 'My parents wanted me to do medicine. At 70% confidence, the games showed me my real strength was data & problem-solving. Sent them the roadmap. They actually understood.',
    rating: 5,
    highlight: 'Parent Buy-in',
  },
  {
    initials: 'SJ',
    name: 'Shreya Joshi',
    role: 'Discovered Design+Tech • DTU 2026',
    quote: 'I was going to choose business just because everyone said so. Career Agent showed me design thinking pays (₹15L+ starting). Now I\'m doing internships in my preferred space.',
    rating: 5,
    highlight: 'Real Salaries',
  },
  {
    initials: 'RK',
    name: 'Rohan Kumar',
    role: 'JEE rank 850 • Chose Law Startups',
    quote: 'Decent JEE rank but not IIT good. The games + counselor made me see I could combine law + startups. That is my path now.',
    rating: 5,
    highlight: 'Non-Traditional Path',
  },
  {
    initials: 'NK',
    name: 'Nisha Kadam',
    role: 'Rural Maharashtra • AI Engineer Path',
    quote: 'English is not my first language. The AI counselor explained career paths in simple terms. I now know exactly what to learn. My school counselor never could.',
    rating: 5,
    highlight: 'Accessible',
  },
  {
    initials: 'VK',
    name: 'Vikram Singh',
    role: 'NEET aspirant turned Biotech Entrepreneur',
    quote: 'Failed NEET twice. Career Agent showed me biotech startups need my skills more than a white coat. Founded a micro-cultures company. Best decision ever.',
    rating: 5,
    highlight: 'Failure Recovery',
  },
  {
    initials: 'PS',
    name: 'Priya Sharma',
    role: 'Public School Parent • Daughter now confident',
    quote: 'My daughter used Career Agent for 2 weeks. Now she explains her career choice to me. I\'m finally sleeping well at night.',
    rating: 5,
    highlight: 'Parent Peace',
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-24 px-6 lg:px-8 relative overflow-hidden">
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
            <span className="w-2 h-2 rounded-full bg-accent-400" />
            <span className="text-sm text-white/70">Real Stories</span>
          </div>

          <h2 className="text-4xl lg:text-5xl font-black text-white">
            Students Who Found
            <br />
            <span className="bg-gradient-to-r from-accent-400 to-emerald-400 bg-clip-text text-transparent">
              Their Path
            </span>
          </h2>
        </motion.div>

        {/* Testimonials grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, idx) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              viewport={{ once: true }}
            >
              <Card className="bg-gradient-to-br from-white/10 to-white/5 border-white/10 p-8 h-full hover:border-white/20 transition-all">
                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-white/90 leading-relaxed mb-6 italic">"{testimonial.quote}"</p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center">
                    <span className="text-sm font-bold text-slate-900">{testimonial.initials}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{testimonial.name}</p>
                    <p className="text-xs text-white/60">{testimonial.role}</p>
                  </div>
                </div>

                {/* Highlight tag */}
                <div className="mt-4 pt-4 border-t border-white/10">
                  <span className="inline-block px-3 py-1 rounded-full bg-primary-600/20 border border-primary-500/30 text-xs text-primary-300 font-medium">
                    {testimonial.highlight}
                  </span>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
