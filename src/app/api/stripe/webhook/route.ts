import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { createSupabaseAdminClient } from '@/lib/supabase';
import { sendSubscriptionEmail, sendWinnerEmail } from '@/lib/email';
import type Stripe from 'stripe';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = headers().get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;
        const plan = session.metadata?.plan as 'monthly' | 'yearly';

        if (!userId || !session.subscription) break;

        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        const amount = subscription.items.data[0]?.price.unit_amount || 0;

        // Upsert subscription record
        await supabase.from('subscriptions').upsert({
          user_id: userId,
          stripe_subscription_id: subscription.id,
          stripe_customer_id: subscription.customer as string,
          plan,
          status: 'active',
          amount_pence: amount,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
        }, { onConflict: 'stripe_subscription_id' });

        // Record charity contribution
        const { data: userCharity } = await supabase
          .from('user_charities')
          .select('charity_id, donation_percentage')
          .eq('user_id', userId)
          .eq('is_active', true)
          .single();

        if (userCharity) {
          const donationAmount = (amount / 100) * (userCharity.donation_percentage / 100);
          await supabase.from('charity_donations').insert({
            user_id: userId,
            charity_id: userCharity.charity_id,
            amount: donationAmount,
            is_subscription_contribution: true,
          });
          // Update total_raised on charity
          await supabase.rpc('increment_charity_raised', {
            charity_id: userCharity.charity_id,
            amount: donationAmount,
          });
        }

        // Auto-generate draw entry from user scores
        const { data: scores } = await supabase
          .from('golf_scores')
          .select('score')
          .eq('user_id', userId)
          .order('score_date', { ascending: false })
          .limit(5);

        if (scores && scores.length > 0) {
          const { data: upcomingDraw } = await supabase
            .from('draws')
            .select('id')
            .in('status', ['pending', 'simulated'])
            .order('draw_year', { ascending: false })
            .order('draw_month', { ascending: false })
            .limit(1)
            .single();

          if (upcomingDraw) {
            const entryNumbers = scores.map((s: any) => s.score).slice(0, 5);
            while (entryNumbers.length < 5) entryNumbers.push(Math.floor(Math.random() * 45) + 1);
            await supabase.from('draw_entries').upsert({
              draw_id: upcomingDraw.id,
              user_id: userId,
              entry_numbers: entryNumbers.sort((a: number, b: number) => a - b),
            }, { onConflict: 'draw_id,user_id' });
          }
        }

        // Send welcome email
        const { data: profile } = await supabase.from('profiles').select('full_name, email').eq('id', userId).single();
        if (profile) {
          await sendSubscriptionEmail(profile.email, profile.full_name, 'renewed',
            new Date(subscription.current_period_end * 1000).toLocaleDateString('en-GB'));
        }
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        await supabase.from('subscriptions').update({
          status: sub.status === 'active' ? 'active' : sub.status === 'canceled' ? 'cancelled' : 'inactive',
          cancel_at_period_end: sub.cancel_at_period_end,
          current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
          current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
        }).eq('stripe_subscription_id', sub.id);
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        await supabase.from('subscriptions').update({ status: 'cancelled' }).eq('stripe_subscription_id', sub.id);
        break;
      }

      case 'invoice.payment_succeeded': {
  const invoice = event.data.object as Stripe.Invoice;

  if (invoice.subscription) {
    await supabase
      .from('subscriptions')
      .update({ status: 'active' })
      .eq('stripe_subscription_id', invoice.subscription as string);
  }

  break;
}

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          await supabase.from('subscriptions').update({ status: 'lapsed' }).eq('stripe_subscription_id', invoice.subscription as string);
          // Get user and send payment failed email
          const { data: sub } = await supabase.from('subscriptions').select('user_id').eq('stripe_subscription_id', invoice.subscription).single();
          if (sub) {
            const { data: profile } = await supabase.from('profiles').select('full_name, email').eq('id', sub.user_id).single();
            if (profile) await sendSubscriptionEmail(profile.email, profile.full_name, 'payment_failed');
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event: ${event.type}`);
    }
  } catch (err: any) {
    console.error('Webhook handler error:', err);
    return NextResponse.json({ error: 'Handler error' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
