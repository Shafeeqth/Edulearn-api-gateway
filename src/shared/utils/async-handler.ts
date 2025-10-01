import { Request, Response, NextFunction } from 'express';
import { LoggingService } from '@/services/observability/logging/logging.service';
import { MetricsService } from '@/services/observability/monitoring/monitoring.service';

type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

const logger = LoggingService.getInstance();
const monitoring = MetricsService.getInstance();

export const asyncHandler = (handler: AsyncHandler) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    const requestId = (req.headers['x-request-id'] as string) || 'unknown';

    try {
      // Log request start
      logger.debug(`Request started: ${req.method} ${req.path}`, {
        requestId,
        method: req.method,
        path: req.path,
        userId: req.user?.userId,
        ip: req.ip,
      });

      const result = await handler(req, res, next);

      const duration = Date.now() - startTime;

      // Log successful completion
      logger.debug(`Request completed: ${req.method} ${req.path}`, {
        requestId,
        method: req.method,
        path: req.path,
        duration,
        statusCode: res.statusCode,
      });

      // Record metrics
      monitoring.measureHttpRequestDuration(req.method, req.path, duration);

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      // Log error with context
      logger.error(`Request failed: ${req.method} ${req.path}`, {
        requestId,
        method: req.method,
        path: req.path,
        duration: duration + "ms",
        error:
          error instanceof Error
            ? {
                message: error.message,
                // stack: error.stack,
                name: error.name,
              }
            : error,
        userId: req.user?.userId,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      });

      // Record error metrics
      // monitoring.incrementErrorCounter(req.method, req.path, error instanceof Error ? error.name : 'UnknownError');

      // Pass error to Express error handler
      next(error);
    }
  };
};

// Specialized async handler for database operations
export const dbAsyncHandler = (handler: AsyncHandler) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    const requestId = (req.headers['x-request-id'] as string) || 'unknown';

    try {
      logger.debug(`Database operation started: ${req.method} ${req.path}`, {
        requestId,
        method: req.method,
        path: req.path,
      });

      const result = await handler(req, res, next);

      const duration = Date.now() - startTime;

      logger.debug(`Database operation completed: ${req.method} ${req.path}`, {
        requestId,
        method: req.method,
        path: req.path,
        duration,
      });

      // Record database operation metrics
      monitoring.recordDatabaseOperationDuration(
        req.method,
        req.path,
        duration
      );

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      logger.error(`Database operation failed: ${req.method} ${req.path}`, {
        requestId,
        method: req.method,
        path: req.path,
        duration,
        error:
          error instanceof Error
            ? {
                message: error.message,
                stack: error.stack,
                name: error.name,
              }
            : error,
      });

      // Record database error metrics
      monitoring.incrementDatabaseErrorCounter(
        req.method,
        req.path,
        error instanceof Error ? error.name : 'UnknownError'
      );

      next(error);
    }
  };
};

// Specialized async handler for external API calls
export const apiAsyncHandler = (handler: AsyncHandler) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    const requestId = (req.headers['x-request-id'] as string) || 'unknown';

    try {
      logger.debug(`External API call started: ${req.method} ${req.path}`, {
        requestId,
        method: req.method,
        path: req.path,
      });

      const result = await handler(req, res, next);

      const duration = Date.now() - startTime;

      logger.debug(`External API call completed: ${req.method} ${req.path}`, {
        requestId,
        method: req.method,
        path: req.path,
        duration,
      });

      // Record external API metrics
      monitoring.recordExternalApiDuration(req.method, req.path, duration);

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      logger.error(`External API call failed: ${req.method} ${req.path}`, {
        requestId,
        method: req.method,
        path: req.path,
        duration,
        error:
          error instanceof Error
            ? {
                message: error.message,
                stack: error.stack,
                name: error.name,
              }
            : error,
      });

      // Record external API error metrics
      monitoring.incrementExternalApiErrorCounter(
        req.method,
        req.path,
        error instanceof Error ? error.name : 'UnknownError'
      );

      next(error);
    }
  };
};
