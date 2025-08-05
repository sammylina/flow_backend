import prisma from '../../../utils/db';
import { ApiError } from '../../../middlewares/error.middleware';

// Define Playlist type
type Playlist = {
  id: number;
  name: string;
  description: string | null;
  level: string;
  lessonCount: number;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
};

type CreatePlaylistData = {
  name: string;
  description?: string;
  level: string;
};

type UpdatePlaylistData = {
  name?: string;
  description?: string;
  level?: string;
  lessonCount?: number;
};

/**
 * Create a new playlist
 */
export const createPlaylist = async (
  userId: number,
  data: CreatePlaylistData
): Promise<Playlist> => {
  // Validate level
  const validLevels = ['beginner', 'intermediate', 'advanced'];
  if (!validLevels.includes(data.level)) {
    throw new ApiError(400, 'Level must be one of: beginner, intermediate, advanced');
  }

  const playlist = await prisma.playlist.create({
    data: {
      name: data.name,
      description: data.description || null,
      level: data.level,
      userId,
    },
  });

  return playlist;
};

/**
 * Get all playlists for a user
 */
export const getUserPlaylists = async (): Promise<Playlist[]> => {
  const playlists = await prisma.playlist.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return playlists;
};

/** * Update a playlist
 */
export const updatePlaylist = async (
  id: number,
  userId: number,
  data: UpdatePlaylistData
): Promise<Playlist> => {
  // Check if playlist exists and belongs to user
  const existingPlaylist = await prisma.playlist.findFirst({
    where: { id, userId },
  });

  if (!existingPlaylist) {
    throw new ApiError(404, 'Playlist not found');
  }

  // Validate level if provided
  if (data.level) {
    const validLevels = ['beginner', 'intermediate', 'advanced'];
    if (!validLevels.includes(data.level)) {
      throw new ApiError(400, 'Level must be one of: beginner, intermediate, advanced');
    }
  }

  const updatedPlaylist = await prisma.playlist.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.level && { level: data.level }),
      ...(data.lessonCount !== undefined && { lessonCount: data.lessonCount }),
    },
  });

  return updatedPlaylist;
};

/**
 * Delete a playlist
 */
export const deletePlaylist = async (id: number, userId: number): Promise<void> => {
  // Check if playlist exists and belongs to user
  const existingPlaylist = await prisma.playlist.findFirst({
    where: { id, userId },
  });

  if (!existingPlaylist) {
    throw new ApiError(404, 'Playlist not found');
  }

  await prisma.playlist.delete({
    where: { id },
  });
};
