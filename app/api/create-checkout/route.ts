import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const STRIPE_PRICE_IDS = {
    'Starter': { priceId: 'price_1T5FPTPRCOojlkAvi1fOqS2M', credits: 10 },
    'Basic': { priceId: 'price_1T5FRrPRCOojlkAvyCd4ZHjo', credits: 30 },
    'Popular': { priceId: 'price_1T6F5SPRCOojlkAvW8KQY5jj', credits: 75 },
    'Pro': { priceId: 'price_1T5FUhPRCOojlkAv3HaP09N6', credits: 200 },
    'Ultimate': { priceId: 'price_1T6F4zPRCOojlkAv7yVpMsLq', credits: 500 },
} as const;

export async function POST(req: NextRequest) {
    try {
          const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
          if (!stripeSecretKey) {
                  return NextResponse.json({ error: 'Payment system not configured' }, { status: 500 });
          }

      const stripe = new Stripe(stripeSecretKey, {
              apiVersion: '2023-10-16',
      });

      const { packName } = await req.json();

      if (!packName || !(packName in STRIPE_PRICE_IDS)) {
              return NextResponse.json({ error: 'Invalid pack name' }, { status: 400 });
      }

      const pack = STRIPE_PRICE_IDS[packName as keyof typeof STRIPE_PRICE_IDS];

      // Auth: verify JWT from Authorization header
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
          const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

      if (!supabaseUrl || !supabaseAnonKey) {
              return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
      }

      const supabaseAuth = createSupabaseClient(supabaseUrl, supabaseAnonKey);

      const authHeader = req.headers.get('authorization');
          if (!authHeader) {
                  return NextResponse.json({ error: 'You must be logged in to purchase credits.' }, { status: 401 });
          }

      const token = authHeader.replace('Bearer ', '');
          const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);

      if (authError || !user) {
              return NextResponse.json({ error: 'You must be logged in to purchase credits.' }, { status: 401 });
      }

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://images.deepvortexai.art';

      const session = await stripe.checkout.sessions.create({
              payment_method_types: ['card'],
              line_items: [{
                        price: pack.priceId,
                        quantity: 1,
              }],
              mode: 'payment',
              success_url: `${appUrl}?success=true&session_id={CHECKOUT_SESSION_ID}`,
              cancel_url: `${appUrl}?canceled=true`,
              metadata: {
                        packName,
                        credits: pack.credits.toString(),
                        userId: user.id,
                        app: 'image-generator',
              },
      });

      return NextResponse.json({ url: session.url });
    } catch (error) {
          console.error('Error:', error);
          return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
    }
}
