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

export const getUserProgress = async (
  userId: number
): Promise<Record<number, Partial<LessonProgress>>> => {
  const dbResults = await prisma.lessonProgress.findMany({
    where: { userId },
    orderBy: { lessonId: 'asc' },
    select: {
      lessonId: true,
      flowCompleted: true,
      studyCompleted: true,
    },
  });

  const progress: Record<number, Partial<LessonProgress>> = {};
  for (const row of dbResults) {
    progress[row.lessonId] = {
      flowCompleted: row.flowCompleted,
      studyCompleted: row.studyCompleted,
    };
  }

  return progress;
};

export const updateUserProgress = async (
  userId: number,
  lessonId: number,
  mode: 'flow' | 'study',
  completed: boolean,
  score?: number
): Promise<Record<number, Partial<LessonProgress>>> => {
  let existing;
  if (mode === 'study') {
    existing = await prisma.lessonProgress.findUnique({
      where: { userId_lessonId: { userId, lessonId } },
    });
    if (completed && !existing?.flowCompleted) {
      throw new ApiError(400, 'Cannot complete study before completing flow');
    }
  }

  const updateData: Partial<LessonProgress> = {};

  if (mode === 'flow') {
    updateData.flowCompleted = completed;
  } else if (mode === 'study') {
    updateData.studyCompleted = completed;
  }

  const finalFlow = mode === 'flow' ? completed : (existing?.flowCompleted ?? false);
  const finalStudy = mode === 'study' ? completed : (existing?.studyCompleted ?? false);
  updateData.completed = finalFlow && finalStudy;

  if (score !== undefined) {
    updateData.score = score;
  }

  await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    update: updateData,
    create: {
      userId,
      lessonId,
      flowCompleted: mode === 'flow' ? completed : false,
      studyCompleted: mode === 'study' ? completed : false,
      completed: finalFlow && finalStudy,
      score,
    },
  });

  // Return the updated map for the user
  return await getUserProgress(userId);
};
