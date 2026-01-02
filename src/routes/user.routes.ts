import { Router } from 'express';
import { getAllUsersHandler, getCurrentUserHandler, getUserByIdHandler, updateUserHandler } from '../controllers/user.controller.js';
import { requireUser } from '../middlewares/requireUser.js';
import { validateResource } from '../middlewares/validateResource.js';
import { updateUserSchema } from '../schemas/user.schema.js';

const router = Router();

// Protected Routes
router.get('/me', requireUser, getCurrentUserHandler);
router.patch('/me', requireUser, validateResource(updateUserSchema), updateUserHandler);

// Public Routes
router.get('/', getAllUsersHandler); // Simplified list
router.get('/:id', getUserByIdHandler); // Get by ID

export default router;
