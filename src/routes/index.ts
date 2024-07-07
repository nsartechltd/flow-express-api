import { Router } from 'express';

import stripe from './stripe';
import users from './users';

const router: Router = Router();

router.use('/stripe', stripe);
router.use('/users', users);

export default router;
