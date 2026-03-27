-- Phase 3: Payment orders table for Razorpay integration
CREATE TABLE IF NOT EXISTS payment_orders (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL CHECK (plan_id IN ('starter', 'pro')),
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'paid', 'captured', 'failed', 'refunded')),
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_payment_orders_user ON payment_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_orders_razorpay ON payment_orders(razorpay_order_id);

-- Ensure profiles.subscription_tier allows our plan values
-- (Already defined in Phase 1 schema with 'free' | 'starter' | 'pro')

-- RLS Policies
ALTER TABLE payment_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payment orders"
  ON payment_orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payment orders"
  ON payment_orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Only server (service role) should update payment orders
-- This is handled by the webhook/verify routes using service role key
CREATE POLICY "Service role can update payment orders"
  ON payment_orders FOR UPDATE
  USING (true);
