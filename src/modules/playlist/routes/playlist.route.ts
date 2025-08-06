import { Router } from 'express';
import { create, getAll, getById, remove, update } from '../controllers/playlist.controller';
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
 * @desc    Get all playlists
 * @access  Private
 */
router.get('/', authenticate, getAll);

/**
 * @router  GET /api/playlist/:id
 * @desc    Get all lesson in a playlist
 * @access  Private
 */
router.get('/:id', authenticate, getById);

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
