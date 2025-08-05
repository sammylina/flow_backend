import { Router } from 'express';
import { create, getAll, remove, update } from '../controllers/playlist.controller';
import { authenticate } from '../../auth/middlewares/auth.middleware';

const router = Router();

/**
 * @route   POST /api/playlists
 * @desc    Create a new playlist
 * @access  Private
 */
router.post('/', authenticate, create);

/**
 * @route   GET /api/playlists
 * @desc    Get all playlists for authenticated user
 * @access  Private
 */
router.get('/', authenticate, getAll);

/**
 * @route   PUT /api/playlists/:id
 * @desc    Update a playlist
 * @access  Private
 */
router.put('/:id', authenticate, update);

/**
 * @route   DELETE /api/playlists/:id
 * @desc    Delete a playlist
 * @access  Private
 */
router.delete('/:id', authenticate, remove);

export default router;
