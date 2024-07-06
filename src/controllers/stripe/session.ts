import { Request, Response } from 'express';

import { getStripeClient } from '../../libs/stripe';
import Stripe from 'stripe';

export const createSession = async (
  req: Request,
  res: Response<Stripe.Response<Stripe.Checkout.Session> | { error: string }>,
) => {
  try {
    const body = req.body;

    console.log('[createSession] Event body: ', JSON.stringify(body));

    const stripe = getStripeClient();

    const flowAppUrl = process.env.FLOW_APP_URL;

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          price: body.priceId,
          quantity: 1,
        },
      ],
      ui_mode: 'embedded',
      return_url: `${flowAppUrl}/subscription-status?session_id={CHECKOUT_SESSION_ID}&price_id=${body.priceId}`,
      subscription_data: {
        trial_period_days: 7,
      },
      customer_email: body.email,
    });

    return res.status(200).json(session);
  } catch (err) {
    console.error('[stripeService] Error creating session on Stripe', err);

    return res
      .status(500)
      .json({ error: 'There was an error creating a Stripe session' });
  }
};

export const getSession = async (
  req: Request<{ sessionId: string }>,
  res: Response<
    | {
        status: string | null;
        paymentStatus: string;
        customerEmail: string;
      }
    | { error: string }
  >,
) => {
  const stripe = getStripeClient();

  try {
    const session = await stripe.checkout.sessions.retrieve(
      req.params.sessionId,
    );

    console.log('[stripeService] Session found: ', JSON.stringify(session));

    const responseBody = {
      status: session.status,
      paymentStatus: session.payment_status,
      customerEmail: '',
    };

    if (session.customer) {
      const customer = await stripe.customers.retrieve(
        String(session.customer),
      );
      // @ts-expect-error customer email DOES exist on the stripe.customers.retrieve request
      responseBody.customerEmail = customer.email;
    }

    return res.status(200).json(responseBody);
  } catch (err) {
    console.error('[stripeService] Error retrieving session on Stripe', err);

    return res
      .status(500)
      .json({ error: 'There was an error retrieving a Stripe session' });
  }
};
