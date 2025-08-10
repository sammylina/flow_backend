import { NextFunction, Request, Response } from 'express';
import { ApiError } from '../../../middlewares/error.middleware';
import logger from '../../../utils/logger';
import { getUserProgress, updateUserProgress } from '../services/progress.service';

/**
 * GET /progress
 * Get progress for the logged-in user
 */
export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError(401, 'Not authenticated');
    }

    const progress = await getUserProgress(userId);

    return res.status(200).json({
      status: 'success',
      data: { progress, userId },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /progress
 * Update progress for a lesson
 */
export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError(401, 'Not authenticated');
    }
    const { mode, completed, score } = req.body;

    const lessonId = parseInt(id, 10);

    if (!lessonId || isNaN(lessonId)) {
      throw new ApiError(400, `Invalid lesson ID`);
    }

    const progress = await updateUserProgress(userId, lessonId, mode, completed, score);

    logger.info(`Progress updated: user ${userId}, lesson ${lessonId}, mode ${mode}`);

    return res.status(200).json({
      status: 'success',
      data: { progress, userId },
    });
  } catch (error) {
    next(error);
  }
};
