-- Fix: Add missing columns to profiles if you ran the OLD migration first
-- Run this in Supabase SQL Editor if you get "Database error saving new user" on signup.
-- This adds the columns required by the roadmap trigger (handle_new_user).

DO $$
BEGIN
  -- Add date_of_birth (required by trigger)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'date_of_birth'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN date_of_birth DATE DEFAULT '2000-01-01' NOT NULL;
  END IF;

  -- Add parent_email
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'parent_email'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN parent_email TEXT;
  END IF;

  -- Add parent_name
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'parent_name'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN parent_name TEXT;
  END IF;

  -- Add subscription_tier
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'subscription_tier'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'starter', 'pro'));
  END IF;
END
$$;
