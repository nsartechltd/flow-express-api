import { Router } from 'express';

import * as controller from '../../controllers/stripe';

const router: Router = Router();

router.post('/webhook', controller.handleStripeWebhook);
router.post('/session', controller.createSession);
router.get('/session/:sessionId', controller.getSession);

export default router;
