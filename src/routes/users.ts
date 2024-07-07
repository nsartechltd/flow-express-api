import { Router } from 'express';

import * as controller from '../controllers/users';

const router: Router = Router();

router.post('/', controller.createUser);

export default router;
