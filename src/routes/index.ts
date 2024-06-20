import { Router } from "express";

import stripe from './stripe';

const router: Router = Router();

router.use('/stripe', stripe);

export default router;