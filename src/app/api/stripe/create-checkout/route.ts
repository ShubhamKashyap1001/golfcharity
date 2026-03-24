import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { stripe, PLANS } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    const body = await req.json();
    const { plan, email } = body as { plan: 'monthly' | 'yearly'; email: string };

    if (!PLANS[plan]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const planInfo = PLANS[plan];
    const userEmail = session?.user?.email || email;
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'You must be logged in to subscribe' }, { status: 401 });
    }

    // Check for existing Stripe customer to avoid duplicate customers
    let customerId: string | undefined;
    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .not('stripe_customer_id', 'is', null)
      .maybeSingle();
    customerId = existingSub?.stripe_customer_id ?? undefined;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      ...(customerId ? { customer: customerId } : { customer_email: userEmail }),
      line_items: [{ price: planInfo.priceId, quantity: 1 }],
      // SUCCESS: go to dashboard, show success toast
      success_url: `${appUrl}/dashboard?payment=success`,
      // CANCEL: go back to subscription page
      cancel_url: `${appUrl}/dashboard/subscription?cancelled=true`,
      // Pass user_id in metadata so webhook can activate the subscription
      metadata: {
        user_id: userId,
        plan,
      },
      subscription_data: {
        metadata: {
          user_id: userId,
          plan,
        },
      },
      // Allow promo codes
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}