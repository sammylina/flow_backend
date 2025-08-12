import { NextFunction, Request, Response } from 'express';
import {
  type StudyItem,
  createLesson,
  createStudyItemService,
  getStudyItems,
} from '../services/lesson.service';
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

export const createStudyItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type, prompt, target_text, audio_url } = req.body;
    const lessonId = parseInt(req.params.id, 10);

    if (isNaN(lessonId)) {
      throw new ApiError(400, `Invalid lesson ID: ${req.params.id}`);
    }
    // TODO: make sure the pronouciation mode has valid audio_url
    if (!type || !prompt || !target_text || !audio_url) {
      throw new ApiError(400, 'Request body missing type, prompt, target_text or audio_url');
    }

    const studyItem = await createStudyItemService(lessonId, {
      type,
      prompt,
      targetText: target_text,
      audioUrl: audio_url,
    });

    return studyItem;
  } catch (error) {
    next(error);
  }
};

function toSnakeCaseStudyItems(studyItems: StudyItem[]) {
  return studyItems.map(({ id, type, prompt, targetText, audioUrl }) => ({
    id,
    type,
    prompt,
    target_text: targetText,
    audio_url: audioUrl,
  }));
}

export const getAllStudyItems = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lessonId = parseInt(req.params.id, 10);

    // Validate that lessonId is a number
    if (isNaN(lessonId)) {
      throw new ApiError(400, 'Invalid lesson ID format.');
    }

    const studyItems = await getStudyItems(lessonId);
    res.status(200).json({
      status: 'success',
      data: {
        studyItems: toSnakeCaseStudyItems(studyItems),
      },
    });
  } catch (error) {
    next(error);
  }
};
