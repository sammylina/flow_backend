import { Router } from 'express';
import { get, update } from '../controllers/progress.controller';
import { authenticate } from '../../auth';

const router = Router();

/**
 * Get progress of a user(logged-in)
 */
router.get('/', authenticate, get);

/**
 * @desc    Update user progress
 *
 */

router.patch('/:id', authenticate, update);

export default router;
