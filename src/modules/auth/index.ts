import authRoutes from './routes/auth.routes';
import { authenticate } from './middlewares/auth.middleware';

export {
  authRoutes,
  authenticate,
};