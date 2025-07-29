import app from './app';
import config from './config';
import logger from './utils/logger';

// Start the server
const server = app.listen(config.port, '0.0.0.0', () => {
  logger.info(`Server running in ${config.env} mode on port ${config.port}`);
  logger.info(`API available at http://localhost:${config.port}/api`);
});

// Handle server errors
server.on('error', (error: NodeJS.ErrnoException) => {
  if (error.code === 'EADDRINUSE') {
    logger.error(`Port ${config.port} is already in use`);
  } else {
    logger.error(`Server error: ${error.message}`);
  }
  process.exit(1);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
  
  // Force close after 10s
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
});