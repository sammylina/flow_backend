import prisma from '../../../utils/db';
import { ApiError } from '../../../middlewares/error.middleware';

type LessonProgress = {
  id: number;
  userId: number;
  lessonId: number;
  completed: boolean;
  flowCompleted: boolean;
  studyCompleted: boolean;
  score?: number | null;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Get progress for a specific user
 */
export const getUserProgress = async (userId: number): Promise<LessonProgress[]> => {
  return await prisma.lessonProgress.findMany({
    where: { userId },
    include: {
      lesson: {
        select: { id: true, title: true, order: true, playlistId: true },
      },
    },
    orderBy: {
      lessonId: 'asc',
    },
  });
};

/**
 * Update user progress for a given lesson and progress type
 * Rules:
 *  - studyCompleted cannot be true unless flowCompleted is already true
 *  - flowCompleted and studyCompleted default to false
 */
export const updateUserProgress = async (
  userId: number,
  lessonId: number,
  mode: 'flow' | 'study',
  completed: boolean,
  score?: number
): Promise<LessonProgress> => {
  if (!['flow', 'study'].includes(mode)) {
    throw new ApiError(400, 'Invalid progress mode');
  }

  // Ensure lesson exists
  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
  if (!lesson) {
    throw new ApiError(404, 'Lesson not found');
  }

  // Fetch existing progress if any
  const existing = await prisma.lessonProgress.findUnique({
    where: { userId_lessonId: { userId, lessonId } },
  });

  // Validation: study cannot be completed unless flow is already completed
  if (mode === 'study' && completed && !existing?.flowCompleted) {
    throw new ApiError(400, 'Cannot complete study before completing flow');
  }

  // Build updated fields
  const updateData: Partial<LessonProgress> = {};
  if (mode === 'flow') {
    updateData.flowCompleted = completed;
    if (!completed) {
      // Reset studyCompleted if flow is undone
      updateData.studyCompleted = false;
    }
  } else if (mode === 'study') {
    updateData.studyCompleted = completed;
  }

  // completed = true only if both are completed
  const finalFlow = mode === 'flow' ? completed : (existing?.flowCompleted ?? false);
  const finalStudy = mode === 'study' ? completed : (existing?.studyCompleted ?? false);
  updateData.completed = finalFlow && finalStudy;

  if (score !== undefined) {
    updateData.score = score;
  }

  // Upsert progress record
  return await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    update: updateData,
    create: {
      userId,
      lessonId,
      flowCompleted: mode === 'flow' ? completed : false,
      studyCompleted: mode === 'study' ? completed : false,
      completed:
        mode === 'study'
          ? false // can't complete until flow is true
          : completed && mode === 'flow' && false, // both must be true
      score,
    },
  });
};
