import { Router } from 'express';
import { create, createStudyItem, getAllStudyItems } from '../controllers/lesson.controller';
import { authenticate } from '../../auth/';

const router = Router();

/**
 * @route   POST /api/lessons
 * @desc    Create a new lesson
 * @access  Private
 */
router.post('/', authenticate, create);

/**
 * @router  /POST /api/lessons/:lessonId/study-items
 * @desc    Create study items
 * @access  Private
 */
router.post('/:id/study-items', authenticate, createStudyItem);

/**
 * @route   GET /api/lessons/:lessonId/study-items
 * @desc    Get all study items for a specific lesson
 * @access  Private
 */
router.get('/:id/study-items', authenticate, getAllStudyItems);

export default router;
