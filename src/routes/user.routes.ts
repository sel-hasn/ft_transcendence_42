import { Router } from 'express';
import { getAllUsersHandler, getCurrentUserHandler, getUserByIdHandler, updateUserHandler } from '../controllers/user.controller';
import { requireUser } from '../middlewares/requireUser';
import { validateResource } from '../middlewares/validateResource';
import { updateUserSchema } from '../schemas/user.schema';

const router = Router();

// Protected Routes
router.get('/me', requireUser, getCurrentUserHandler);
router.patch('/me', requireUser, validateResource(updateUserSchema), updateUserHandler);

// Public Routes
router.get('/', getAllUsersHandler); // Simplified list
router.get('/:id', getUserByIdHandler); // Get by ID

export default router;
