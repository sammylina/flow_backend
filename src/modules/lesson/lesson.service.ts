import prisma from '../../utils/db';

export const createLesson = async (
  title: string,
  audioUrl: string,
  duration: number,
  playlistId: number,
  order: number
) => {
  return prisma.lesson.create({
    data: {
      title,
      audioUrl,
      duration,
      playlistId,
      order,
    },
  });
};

export const getLessonById = async (id: number) => {
  return prisma.lesson.findUnique({
    where: { id },
  });
};

export const getLessonsByPlaylistId = async (playlistId: number) => {
  return prisma.lesson.findMany({
    where: { playlistId },
    orderBy: { order: 'asc' },
  });
};

export const updateLesson = async (
  id: number,
  data: { title?: string; audioUrl?: string; duration?: number; order?: number }
) => {
  return prisma.lesson.update({
    where: { id },
    data,
  });
};

export const deleteLesson = async (id: number) => {
  return prisma.lesson.delete({
    where: { id },
  });
};
