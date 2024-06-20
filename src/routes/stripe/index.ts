import { Router } from "express";

import * as controller from "../../controllers/stripe/webhook";

const router: Router = Router();

router.post('/webhook', controller.handleStripeWebhook)

export default router;