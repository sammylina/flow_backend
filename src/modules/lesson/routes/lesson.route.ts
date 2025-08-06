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
//router.get('/lessons', fetchLessons) // By default it fetches lessons by playlist id
//router.get('/lessons:id', fetchLessonById)
//router.get('/lessons:id/studyItems', fetchLessonStudyItems)

export default router;
