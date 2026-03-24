import { loadStripe } from '@stripe/stripe-js';
import Stripe from 'stripe';

// Client-side Stripe
let stripePromise: ReturnType<typeof loadStripe>;
export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }
  return stripePromise;
};

// Server-side Stripe (use only in API routes / Server Actions)
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
});

export const PLANS = {
  monthly: {
    priceId: process.env.STRIPE_MONTHLY_PRICE_ID!,
    amount: 1999, // £19.99 in pence
    label: 'Monthly',
    interval: 'month' as const,
  },
  yearly: {
    priceId: process.env.STRIPE_YEARLY_PRICE_ID!,
    amount: 19999, // £199.99 in pence
    label: 'Yearly',
    interval: 'year' as const,
  },
};

// Prize pool split percentages
export const PRIZE_POOL_SPLIT = {
  five_match: 0.40,   // 40% jackpot
  four_match: 0.35,   // 35%
  three_match: 0.25,  // 25%
};

// Charity contribution
export const MIN_CHARITY_PERCENTAGE = 10; // 10% minimum

// Prize pool % of subscription
export const PRIZE_POOL_PERCENTAGE = 0.60; // 60% to prize pool
export const CHARITY_PERCENTAGE = 0.10;    // 10% to charity (min)
export const PLATFORM_PERCENTAGE = 0.30;   // 30% platform
