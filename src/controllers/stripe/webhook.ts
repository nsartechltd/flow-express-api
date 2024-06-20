import { Request, Response } from "express";

import { StripeWebhookTypes } from "../../types/stripe";

export const handleStripeWebhook = async (req: Request, res: Response) => {
  const body = req.body;

  console.log('[stripeController] Event received: ', JSON.stringify(body));

  switch (body.type) {
    case StripeWebhookTypes.CheckoutSessionCompleted:
      return await checkoutSessionCompleted(req, res);
    case StripeWebhookTypes.ChargeSucceeded:
      return await chargeSucceeded(req, res);
    default:
      return res.status(400).json({
        message: 'Webhook type is not supported'
      });
  }
}

async function checkoutSessionCompleted(req: Request, res: Response) {
  return res.status(200);
}

async function chargeSucceeded(req: Request, res: Response) {
  return res.status(200);
}