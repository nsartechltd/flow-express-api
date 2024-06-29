import { Request, Response } from 'express';
import Stripe from 'stripe';

import { StripeWebhookTypes } from '../../types/stripe';
import { getPrismaClient } from '../../libs/prisma';

type StripeRequest<T> = Request<unknown, unknown, T>;

export const handleStripeWebhook = async (
  req: StripeRequest<
    Stripe.CheckoutSessionCompletedEvent | Stripe.ChargeSucceededEvent
  >,
  res: Response,
) => {
  const body = req.body;

  console.log('[stripeController] Event received: ', JSON.stringify(body));

  switch (body.type) {
    case StripeWebhookTypes.CheckoutSessionCompleted:
      return await checkoutSessionCompleted(
        req as StripeRequest<Stripe.CheckoutSessionCompletedEvent>,
        res,
      );
    case StripeWebhookTypes.ChargeSucceeded:
      return await chargeSucceeded(
        req as StripeRequest<Stripe.ChargeSucceededEvent>,
        res,
      );
    default:
      return res.status(400).json({
        message: 'Webhook type is not supported',
      });
  }
};

async function checkoutSessionCompleted(
  req: StripeRequest<Stripe.CheckoutSessionCompletedEvent>,
  res: Response<{ success: boolean; error?: string }>,
) {
  const body: Stripe.CheckoutSessionCompletedEvent = req.body;

  console.log(
    '[checkoutSessionCompletedWebhook] Event body: ',
    JSON.stringify(body),
  );

  try {
    const customerEmail = body.data.object.customer_details?.email;

    console.log(
      '[checkoutSessionCompletedWebhook] Customer email: ',
      customerEmail,
    );

    if (!customerEmail) {
      throw new Error(
        `No 'customer_email' was present in the the webhook body. Unable to start user subscription.`,
      );
    }

    const prisma = getPrismaClient();

    const user = await prisma.user.findFirst({
      where: {
        email: customerEmail,
      },
      include: {
        organisation: true,
      },
    });

    if (!user) {
      throw new Error('User was not found, retry webhook.');
    }

    console.log('[checkoutSessionCompletedWebhook] User found: ', user);

    const organisation = await prisma.organisation.update({
      where: {
        id: user.organisation.id,
      },
      data: {
        stripeSubscriptionId: String(body.data.object.subscription),
      },
    });

    console.log(
      '[checkoutSessionCompletedWebhook] Organisation updated: ',
      organisation,
    );

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(
      '[checkoutSessionCompletedWebhook] Error handling Stripe webhook: ',
      err,
    );

    let status: number = 500;

    if (err instanceof Stripe.errors.StripeSignatureVerificationError) {
      status = Number(err.statusCode);
    }

    // Return the initial AWS request ID to help with log searching
    const webhookId = req.body.id;

    return res.status(status).json({
      success: false,
      error: `Stripe Webhook ID: '${webhookId}' - There was a problem handling the Stripe webhook.`,
    });
  }
}

async function chargeSucceeded(
  req: StripeRequest<Stripe.ChargeSucceededEvent>,
  res: Response,
) {
  return res.status(200);
}
