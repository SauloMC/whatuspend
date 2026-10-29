// src/app/actions/stripe.ts
'use server';

import Stripe from 'stripe';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-01-27.acacia' as any })
  : null;

export interface CheckoutResponse {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Server Action: Create Stripe Checkout Session for Pro Personal or Pro Business
 */
export async function createCheckoutSessionAction(
  tier: 'PRO_PERSONAL' | 'PRO_BUSINESS',
  userId?: string,
  userEmail?: string
): Promise<CheckoutResponse> {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // If Stripe secret key is not set, return simulated development redirect
    if (!stripe) {
      console.warn('STRIPE_SECRET_KEY no está configurado en .env. Modo simulación activo.');
      return {
        success: true,
        url: `${appUrl}/dashboard?simulated_upgrade=${tier.toLowerCase()}`,
      };
    }

    const priceId =
      tier === 'PRO_PERSONAL'
        ? process.env.STRIPE_PRO_PERSONAL_PRICE_ID
        : process.env.STRIPE_PRO_BUSINESS_PRICE_ID;

    if (!priceId) {
      return {
        success: false,
        error: `Price ID no configurado para el plan ${tier} en .env.`,
      };
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      billing_address_collection: 'auto',
      customer_email: userEmail,
      client_reference_id: userId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      subscription_data: {
        trial_period_days: 14,
        metadata: {
          userId: userId || 'anonymous',
          tier,
        },
      },
      success_url: `${appUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}&plan=${tier}`,
      cancel_url: `${appUrl}/#planes`,
    });

    return {
      success: true,
      url: session.url || undefined,
    };
  } catch (error) {
    console.error('Error creating Stripe checkout session:', error);
    return {
      success: false,
      error: (error as Error).message || 'Error al iniciar checkout de Stripe.',
    };
  }
}

