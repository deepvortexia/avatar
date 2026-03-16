import { buffer } from 'micro';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';

// Disable body parsing - CRITICAL for Stripe webhooks
export const config = {
    api: {
          bodyParser: false,
    },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16',
});

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
  ) {
    if (req.method !== 'POST') {
          res.setHeader('Allow', 'POST');
          return res.status(405).end('Method Not Allowed');
    }

  console.log('Webhook received (Pages API)');

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!webhookSecret || !supabaseUrl || !supabaseServiceRoleKey) {
        console.error('Missing environment variables');
        return res.status(500).json({ error: 'Configuration error' });
  }

  let event: Stripe.Event;

  try {
        const rawBody = await buffer(req);
        const signature = req.headers['stripe-signature'] as string;

      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
        console.log('Signature verified! Event:', event.type);
  } catch (err) {
        const error = err as Error;
        console.error('Webhook signature verification failed:', error.message);
        return res.status(400).json({ error: `Webhook Error: ${error.message}` });
  }

  // Handle checkout.session.completed
  if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;

      const app = session.metadata?.app;
      console.log(`💳 Processing payment from app: '${app || 'unknown'}'`, {
              sessionId: session.id,
              metadata: session.metadata,
      });

      // Accept purchases from ALL apps (hub, emoticon-generator, image-generator)
      // No more filtering — this webhook is the universal handler

      const userId = session.metadata?.userId;
        const credits = session.metadata?.credits;
        const packName = session.metadata?.packName;

      if (!userId || !credits) {
              console.error('Missing metadata');
              return res.status(400).json({ error: 'Missing metadata' });
      }

      const creditsToAdd = parseInt(credits, 10);

      const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
              auth: { autoRefreshToken: false, persistSession: false },
      });

      // Idempotency check — ignore duplicate webhook deliveries
      const { data: existing } = await supabase
          .from('transactions')
          .select('id')
          .eq('stripe_session_id', session.id)
          .single()

      if (existing) {
          console.log('Duplicate webhook event, already processed:', session.id)
          return res.status(200).json({ received: true })
      }

      // Get current credits
      const { data: profile, error: fetchError } = await supabase
          .from('profiles')
          .select('credits')
          .eq('id', userId)
          .single();

      if (fetchError) {
              console.error('Profile fetch error:', fetchError);
              return res.status(404).json({ error: 'User not found' });
      }

      const currentCredits = profile?.credits || 0;
        const newCredits = currentCredits + creditsToAdd;

      console.log('Updating credits:', { currentCredits, adding: creditsToAdd, newTotal: newCredits });

      // Update credits
      const { error: updateError } = await supabase
          .from('profiles')
          .update({ credits: newCredits, updated_at: new Date().toISOString() })
          .eq('id', userId);

      if (updateError) {
              console.error('Update error:', updateError);
              return res.status(500).json({ error: 'Failed to update credits' });
      }

      console.log(`✅ Credits updated successfully! (from ${app || 'unknown'})`, { userId, newCredits });

      // Record transaction (non-critical)
      try {
              await supabase.from('transactions').insert({
                        user_id: userId,
                        stripe_session_id: session.id,
                        stripe_payment_intent: session.payment_intent as string,
                        pack_name: packName || 'Unknown Package',
                        amount_cents: session.amount_total || 0,
                        credits_purchased: creditsToAdd,
                        status: 'completed',
              });
              console.log('Transaction recorded');

          if (!packName) {
                    console.warn('Package name missing from session metadata');
          }
      } catch (txErr) {
              console.warn('Transaction record failed (non-critical):', txErr);
      }

      // Add billing log to emails table (non-critical)
      try {
              await supabase.from('emails').insert({
                        user_id: userId,
                        type: 'purchase_confirmation',
                        subject: `Credits purchased: ${packName || 'Unknown Package'} Pack (${creditsToAdd} credits)`,
                        body: JSON.stringify({
                                    packName: packName || 'Unknown Package',
                                    credits: creditsToAdd,
                                    amountCents: session.amount_total || 0,
                                    stripeSessionId: session.id,
                                    app: app || 'unknown',
                                    timestamp: new Date().toISOString(),
                        }),
                        status: 'logged',
              });
              console.log('Billing log saved to emails table');
      } catch (emailError) {
              console.warn('Failed to save billing log (non-critical):', emailError);
      }

      return res.status(200).json({ received: true, creditsAdded: creditsToAdd });
  }

  return res.status(200).json({ received: true });
}
