import { Router } from 'express';
import taskRoutes from './task.routes';

const router = Router();

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
  });
});

// API routes
router.use('/tasks', taskRoutes);

export default router;