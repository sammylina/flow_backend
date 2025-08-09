import { Router } from 'express';
import { create } from '../controllers/lesson.controller';
import { authenticate } from '../../auth/';

const router = Router();

/**
 * @route   POST /api/lessons
 * @desc    Create a new lesson
 * @access  Private
 */
router.post('/', authenticate, create);

export default router;
