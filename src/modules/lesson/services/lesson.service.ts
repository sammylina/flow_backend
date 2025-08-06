import prisma from '../../../utils/db';
import { ApiError } from '../../../middlewares/error.middleware';

type Lesson = {
  id: number;
  title: string;
  audioUrl: string;
  playlistId: number;
  order: number;
  createdAt: Date;
  updatedAt: Date;
};

type CreateLessonData = {
  title: string;
  audioUrl: string;
  playlistId: number;
};

export const createLesson = async (data: CreateLessonData): Promise<Lesson> => {
  // Check if playlist exists
  const playlistCount = await prisma.playlist.count({ where: { id: data.playlistId } });
  if (playlistCount !== 1) {
    throw new ApiError(400, 'Playlist not found');
  }

  // Create lesson
  const lesson = await prisma.lesson.create({ data });
  return lesson;
};
