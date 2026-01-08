import { Router } from 'express';
import {
    loginHandler,
    logoutHandler,
    refreshAccessTokenHandler,
    registerHandler
} from '../controllers/auth.controller.js';
import { requireUser } from '../middlewares/requireUser.js';
import { validateResource } from '../middlewares/validateResource.js';
import {
    loginSchema,
    registerSchema,
    refreshSchema
} from '../schemas/auth.schema.js';

const router = Router();

// Register
router.post('/signup', validateResource(registerSchema), registerHandler);

// Login
router.post('/login', validateResource(loginSchema), loginHandler);

// Refresh Token
router.post('/refresh', validateResource(refreshSchema), refreshAccessTokenHandler);

// Logout
router.post('/logout', logoutHandler);



export default router;
