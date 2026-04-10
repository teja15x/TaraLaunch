'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/utils/helpers';
import toast from 'react-hot-toast';

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void; on: (event: string, cb: () => void) => void };
  }
}

// Inline definition to avoid importing from lib if the structure changed slightly
type PlanId = 'free' | 'starter' | 'pro';

const PREMIUM_PLANS = {
  free: {
    id: 'free',
    name: 'Discovery',
    price: 0,
    interval: 'forever',
    description: 'Basic psychometric profiling via limited game access.',
    features: [
      'Access to 2 Mini-Games',
      'Basic RIASEC Profile',
      'Community Forum Access',
      'Standard Support'
    ]
  },
  starter: {
    id: 'starter',
    name: 'Visionary',
    price: 999,
    interval: 'month',
    description: 'Full psychometric engine unlock with AI parent dashboard.',
    features: [
      'Unlimited Game Modules',
      'Deep Big Five & Gardner Analysis',
      'Live Parent Dashboard Sync',
      'AI Counselor Weekly Report',
      'Priority Email Support'
    ]
  },
  pro: {
    id: 'pro',
    name: 'Institutional',
    price: 4999,
    interval: 'year',
    description: 'For coaching centers and serious academic planning.',
    features: [
      'Everything in Visionary',
      '1-on-1 Human Career Counselor Session (Monthly)',
      'University Application Roadmap',
      'Ivy League / Tier-1 Probability Predictor',
      '24/7 Dedicated Concierge'
    ]
  }
};

export default function PremiumPricingPage() {
  const { profile, user } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const currentPlan = profile?.subscription_tier || 'free';

  const handleUpgrade = async (planId: PlanId) => {
    if (planId === 'free' || planId === currentPlan) return;
    setLoading(planId);

    try {
      // Create order
      const res = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || 'Failed to create order');
        setLoading(null);
        return;
      }

      const { orderId, amount, currency, keyId } = await res.json();

      // Load Razorpay script if not loaded
      if (!window.Razorpay) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load Razorpay'));  
          document.head.appendChild(script);
        });
      }

      const options = {
        key: keyId,
        amount,
        currency,
        name: 'Career Agent AI',
        description: `${PREMIUM_PLANS[planId].name} Plan`,
        order_id: orderId,
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          // Verify payment
          const verifyRes = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response),
          });

          if (verifyRes.ok) {
            toast.success(`Upgraded to ${PREMIUM_PLANS[planId].name}! Welcome to the premium tier.`);   
            window.location.reload();
          } else {
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          email: user?.email || '',
          name: profile?.full_name || '',
        },
        theme: {
          color: '#4f46e5', // Indigo-600
        },
        modal: {
          ondismiss: () => setLoading(null),
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Something went wrong initializing the secure checkout window.');
    } finally {
      setLoading(null);
    }
  };

  const plans = Object.values(PREMIUM_PLANS);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 lg:py-20 font-sans">
      
      {/* Header Section */}
      <div className="text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4">
            Invest in Your Child's <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">True Potential</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto">
            Move beyond guesswork. Let our gamified psychometric engine map the neural patterns that predict long-term career fulfillment.
          </p>
        </motion.div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch relative z-10">
        {plans.map((plan, idx) => {
          const isCurrent = currentPlan === plan.id;
          const isPopular = plan.id === 'starter';

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="h-full"
            >
              <Card
                className={cn(
                  'relative h-full flex flex-col p-8 rounded-3xl transition-all duration-300',
                  isPopular 
                    ? 'bg-gradient-to-b from-indigo-900/40 to-slate-900 border-indigo-500/50 shadow-2xl shadow-indigo-500/20 scale-105 z-20' 
                    : 'bg-slate-900/50 border-slate-800 hover:border-slate-700',
                  isCurrent && 'border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/50'
                )}
              >
                {/* Badges */}
                {isPopular && !isCurrent && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold uppercase tracking-widest rounded-full shadow-lg">
                    Recommended
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold uppercase tracking-widest rounded-full shadow-lg flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    Active Plan
                  </div>
                )}

                {/* Plan Header */}
                <div className="text-center mb-8 pt-4">
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-sm text-slate-400 h-10 flex items-center justify-center">
                    {plan.description}
                  </p>
                </div>

                {/* Price */}
                <div className="flex items-end justify-center gap-1 mb-8">
                  <span className="text-sm font-bold text-slate-400 mb-1 lg:mb-2">₹</span>
                  <span className="text-5xl font-black text-white">{plan.price}</span>
                  <span className="text-slate-500 text-sm mb-1 lg:mb-2">/{plan.interval}</span>
                </div>

                {/* Features List */}
                <ul className="space-y-4 mb-10 flex-1">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-300">
                      <div className="mt-1 shrink-0 w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <svg className="w-3 h-3 text-emerald-400" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M11.6666 3.5L5.24992 9.91667L2.33325 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <span className="text-sm leading-tight">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Action Button */}
                <button
                  onClick={() => handleUpgrade(plan.id as PlanId)}
                  disabled={isCurrent || plan.id === 'free'}
                  className={cn(
                    "w-full py-4 rounded-xl font-bold transition-all duration-300 relative overflow-hidden group",
                    isCurrent 
                      ? "bg-slate-800 text-slate-400 cursor-not-allowed" 
                      : plan.id === 'free'
                        ? "bg-slate-800 text-slate-400 cursor-not-allowed"
                        : isPopular
                          ? "bg-indigo-600 text-white hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/30"
                          : "bg-white/5 text-white hover:bg-white/10"
                  )}
                >
                  {loading === plan.id && (
                    <div className="absolute inset-0 flex items-center justify-center bg-inherit z-10">
                      <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  )}
                  {isCurrent ? 'Current Tier' : plan.price === 0 ? 'Basic Access' : 'Upgrade Securely'}
                </button>

              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Footer Trust Indicators */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-16 text-center"
      >
        <div className="flex items-center justify-center gap-4 text-xs font-medium text-slate-500 tracking-wider uppercase mb-2">
          <span>Secure AES-256 Encryption</span>
          <span>â€¢</span>
          <span>Cancel Anytime</span>
        </div>
        <p className="text-slate-600 text-xs flex items-center justify-center gap-2">
          Payments securely powered by <span className="font-bold text-slate-400">Razorpay</span>
        </p>
      </motion.div>

    </div>
  );
}