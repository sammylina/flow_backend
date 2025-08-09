import { NextFunction, Request, Response } from 'express';
import { createLesson } from '../services/lesson.service';
import { ApiError } from '../../../middlewares/error.middleware';
import logger from '../../../utils/logger';

/**
 * Create a new lesson
 */
export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, audioUrl } = req.body;
    let playlistId = req.body.playlistId;
    const userId = req.user?.id;

    if (!userId) {
      throw new ApiError(401, 'Not authenticated');
    }

    playlistId = parseInt(playlistId, 10);

    if (!title || !audioUrl || !playlistId) {
      throw new ApiError(400, 'title, audioUrl and playlistId are required');
    }

    const lesson = await createLesson({ title, audioUrl, playlistId });

    logger.info(`Lesson created: ${lesson.id}`);

    return res.status(201).json({
      status: 'success',
      data: {
        lesson,
      },
    });
  } catch (error) {
    next(error);
  }
};
