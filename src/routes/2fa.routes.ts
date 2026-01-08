import { Router } from 'express';
import {
    authenticate2FAHandler,
    generate2FAHandler,
    turnOn2FAHandler
} from '../controllers/2fa.controller.js';
import { requireUser } from '../middlewares/requireUser.js';
import { validateResource } from '../middlewares/validateResource.js';
import {
    twoFASchema,
    verify2FASchema
} from '../schemas/2fa.schema.js';

const router = Router();

// 2FA - Step 2 of Login (Public, because user isn't fully logged in yet)
router.post('/authenticate', validateResource(verify2FASchema), authenticate2FAHandler);

// 2FA - Setup (Protected: You must be logged in to turn it on)
router.post('/generate', requireUser, generate2FAHandler);
router.post('/turn-on', requireUser, validateResource(twoFASchema), turnOn2FAHandler);

export default router;
