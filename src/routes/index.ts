import { Router } from 'express';
import { authRoutes, playlistRoutes } from '../modules';

const router = Router();

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/playlists', playlistRoutes);

export default router;
