import { NextFunction, Request, Response } from 'express';
import {
  createPlaylist,
  deletePlaylist,
  getPlaylistById,
  getUserPlaylists,
  updatePlaylist,
} from '../services/playlist.service';
import logger from '../../../utils/logger';
import { ApiError } from '../../../middlewares/error.middleware';

/**
 * Create a new playlist
 */
export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, level } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      throw new ApiError(401, 'Not authenticated');
    }

    // Validate input
    if (!name || !level) {
      throw new ApiError(400, 'Name and level are required');
    }

    // Create playlist
    const playlist = await createPlaylist(userId, { name, description, level });

    logger.info(`Playlist created: ${playlist.id} by user: ${userId}`);

    return res.status(201).json({
      status: 'success',
      data: {
        playlist,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single playlist by ID
 */
export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw new ApiError(401, 'Not authenticated');
    }

    // Validate ID
    const playlistId = parseInt(id, 10);
    if (isNaN(playlistId)) {
      throw new ApiError(400, 'Invalid playlist ID');
    }

    // Get playlist
    const playlist = await getPlaylistById(playlistId);

    if (!playlist) {
      throw new ApiError(404, 'Playlist not found');
    }

    // Ensure the playlist belongs to the authenticated user
    if (playlist.userId !== userId) {
      throw new ApiError(403, 'Forbidden');
    }

    return res.status(200).json({
      status: 'success',
      data: {
        playlist,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all playlists for the authenticated user
 */
export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new ApiError(401, 'Not authenticated');
    }

    // Get user playlists
    const playlists = await getUserPlaylists();

    return res.status(200).json({
      status: 'success',
      data: {
        playlists,
        count: playlists.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a playlist
 */
export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, description, level, lessonCount } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      throw new ApiError(401, 'Not authenticated');
    }

    // Validate ID
    const playlistId = parseInt(id, 10);
    if (isNaN(playlistId)) {
      throw new ApiError(400, 'Invalid playlist ID');
    }

    // Update playlist
    const playlist = await updatePlaylist(playlistId, userId, {
      name,
      description,
      level,
      lessonCount,
    });

    logger.info(`Playlist updated: ${playlist.id} by user: ${userId}`);

    return res.status(200).json({
      status: 'success',
      data: {
        playlist,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a playlist
 */
export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw new ApiError(401, 'Not authenticated');
    }

    // Validate ID
    const playlistId = parseInt(id, 10);
    if (isNaN(playlistId)) {
      throw new ApiError(400, 'Invalid playlist ID');
    }

    // Delete playlist
    await deletePlaylist(playlistId, userId);

    logger.info(`Playlist deleted: ${playlistId} by user: ${userId}`);

    return res.status(200).json({
      status: 'success',
      message: 'Playlist deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
