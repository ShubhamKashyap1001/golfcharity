import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { stripe } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: sub } = await supabase
      .from('subscriptions')
      .select('stripe_subscription_id')
      .eq('user_id', session.user.id)
      .eq('status', 'active')
      .single();

    if (!sub?.stripe_subscription_id) {
      return NextResponse.json({ error: 'No active subscription' }, { status: 400 });
    }

    await stripe.subscriptions.update(sub.stripe_subscription_id, {
      cancel_at_period_end: true,
    });

    await supabase.from('subscriptions').update({ cancel_at_period_end: true }).eq('stripe_subscription_id', sub.stripe_subscription_id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
