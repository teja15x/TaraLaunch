// Razorpay configuration and plan definitions

export const SUBSCRIPTION_PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    currency: 'INR',
    features: [
      '3 core assessment games',
      'Basic career recommendations (top 3)',
      'Limited chat messages (20/day)',
    ],
    limits: {
      games: 3,
      chatMessagesPerDay: 20,
      careerMatches: 3,
      parentDashboard: false,
      advancedGames: false,
    },
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 299,
    currency: 'INR',
    razorpayPlanId: process.env.RAZORPAY_STARTER_PLAN_ID || '',
    features: [
      'All 7 assessment games',
      'Top 5 career recommendations',
      'Unlimited chat messages',
      'Parent dashboard access',
      'Detailed trait breakdown',
    ],
    limits: {
      games: 7,
      chatMessagesPerDay: Infinity,
      careerMatches: 5,
      parentDashboard: true,
      advancedGames: true,
    },
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 599,
    currency: 'INR',
    razorpayPlanId: process.env.RAZORPAY_PRO_PLAN_ID || '',
    features: [
      'Everything in Starter',
      'Top 10 career recommendations with education paths',
      'AI-powered career counseling chat',
      'Downloadable PDF report',
      'Priority support',
      'Counselor validation badge',
    ],
    limits: {
      games: 7,
      chatMessagesPerDay: Infinity,
      careerMatches: 10,
      parentDashboard: true,
      advancedGames: true,
    },
  },
} as const;

export type PlanId = keyof typeof SUBSCRIPTION_PLANS;

export function getPlanLimits(planId: PlanId) {
  return SUBSCRIPTION_PLANS[planId].limits;
}

export function canAccessFeature(planId: PlanId, feature: keyof typeof SUBSCRIPTION_PLANS['free']['limits']): boolean {
  const limits = getPlanLimits(planId);
  const value = limits[feature];
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value > 0;
  return false;
}
