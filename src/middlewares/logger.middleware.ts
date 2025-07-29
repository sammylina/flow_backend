import { NextFunction, Request, Response } from 'express';
import logger from '../utils/logger';

/**
 * Middleware to log HTTP requests
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  // Log request details
  logger.http(`${req.method} ${req.url} [STARTED]`);

  // Log request body if it exists
  if (req.body && Object.keys(req.body).length > 0) {
    logger.debug(`Request Body: ${JSON.stringify(req.body)}`);
  }

  // Log query parameters if they exist
  if (req.query && Object.keys(req.query).length > 0) {
    logger.debug(`Query Params: ${JSON.stringify(req.query)}`);
  }

  // Capture response
  const originalSend = res.send;
  res.send = function (body) {
    const duration = Date.now() - start;

    // Log response details
    logger.http(
      `${req.method} ${req.url} [COMPLETED] - Status: ${res.statusCode} - Duration: ${duration}ms`
    );

    return originalSend.call(this, body);
  };

  next();
};
