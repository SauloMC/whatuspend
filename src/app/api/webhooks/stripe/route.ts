// src/app/api/webhooks/stripe/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { PrismaClient, PlanType } from '@prisma/client';

const prisma = new PrismaClient();
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-01-27.acacia' as any })
  : null;

export async function POST(req: Request) {
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe no configurado' }, { status: 500 });
  }

  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Firma de webhook ausente' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Error verificando firma de webhook de Stripe:', err);
    return NextResponse.json({ error: 'Firma inválida' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        if (userId) {
          // Identify plan type from line items or metadata
          const tier = (session.metadata?.tier as PlanType) || PlanType.PRO_PERSONAL;

          await prisma.user.update({
            where: { id: userId },
            data: {
              plan: tier,
              stripeCustomerId: customerId,
              stripeSubscriptionId: subscriptionId,
            },
          });
          console.log(`[Stripe Webhook] Usuario ${userId} actualizado a plan ${tier}`);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = (invoice as any).subscription as string;

        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          await prisma.user.updateMany({
            where: { stripeSubscriptionId: subscriptionId },
            data: {
              stripeCurrentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
            },
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await prisma.user.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            plan: PlanType.FREE,
            stripeSubscriptionId: null,
            stripePriceId: null,
          },
        });
        console.log(`[Stripe Webhook] Suscripción ${subscription.id} cancelada, plan revertido a FREE`);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error procesando evento de Stripe:', error);
    return NextResponse.json({ error: 'Error procesando webhook' }, { status: 500 });
  }
}

