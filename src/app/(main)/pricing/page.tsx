'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { SUBSCRIPTION_PLANS, type PlanId } from '@/lib/razorpay';
import { cn } from '@/utils/helpers';
import toast from 'react-hot-toast';

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void; on: (event: string, cb: () => void) => void };
  }
}

export default function PricingPage() {
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
        name: 'Career Agent',
        description: `${SUBSCRIPTION_PLANS[planId].name} Plan`,
        order_id: orderId,
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          // Verify payment
          const verifyRes = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response),
          });

          if (verifyRes.ok) {
            toast.success(`Upgraded to ${SUBSCRIPTION_PLANS[planId].name}!`);
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
          color: '#7c3aed',
        },
        modal: {
          ondismiss: () => setLoading(null),
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Something went wrong');
    } finally {
      setLoading(null);
    }
  };

  const plans = Object.values(SUBSCRIPTION_PLANS);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Choose Your Plan</h1>
        <p className="text-primary-200">Unlock more games, deeper insights, and personalized career guidance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrent = currentPlan === plan.id;
          const isPopular = plan.id === 'starter';

          return (
            <Card
              key={plan.id}
              className={cn(
                'relative flex flex-col',
                isPopular && 'border-purple-500/50 bg-purple-600/10',
                isCurrent && 'border-emerald-500/50 bg-emerald-600/10'
              )}
            >
              {isPopular && !isCurrent && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-full">
                  Most Popular
                </span>
              )}
              {isCurrent && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-full">
                  Current Plan
                </span>
              )}

              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-white">
                    {plan.price === 0 ? 'Free' : `₹${plan.price}`}
                  </span>
                  {plan.price > 0 && <span className="text-white/50 text-sm">/month</span>}
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-white/80">
                    <span className="text-emerald-400 mt-0.5">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleUpgrade(plan.id as PlanId)}
                disabled={isCurrent || plan.id === 'free'}
                loading={loading === plan.id}
                variant={isPopular ? 'primary' : 'secondary'}
                className="w-full"
              >
                {isCurrent ? 'Current Plan' : plan.price === 0 ? 'Free Forever' : 'Upgrade'}
              </Button>
            </Card>
          );
        })}
      </div>

      <div className="text-center">
        <p className="text-white/40 text-xs">Payments powered by Razorpay. Cancel anytime. Prices in INR.</p>
      </div>
    </div>
  );
}
