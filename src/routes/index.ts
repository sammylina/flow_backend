import { Router } from 'express';
import { authRoutes, lessonRoutes, playlistRoutes, progressRoutes } from '../modules';

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
router.use('/lessons', lessonRoutes);
router.use('/progress', progressRoutes);

export default router;
