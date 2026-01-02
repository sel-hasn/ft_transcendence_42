import { Router } from 'express';
import { loginHandler, logoutHandler, refreshAccessTokenHandler, registerHandler } from '../controllers/auth.controller';
import { validateResource } from '../middlewares/validateResource';
import { loginSchema, registerSchema, refreshSchema } from '../schemas/auth.schema';

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
