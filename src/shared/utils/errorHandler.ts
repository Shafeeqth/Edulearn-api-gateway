import { Request, Response, NextFunction } from 'express';
import { MulterError } from 'multer';
import { BaseError } from './errors/base-error';
import { clearCookies } from '@/domains/auth/utils/manage-cookies';

const ResponseStatus = {
  success: 'success',
  error: 'error',
} as const;

export interface ErrorResponse {
  success: boolean;
  message: string;
  error: {
    errorCode: string;
    details: Array<{
      message: string;
      field?: string;
    }>;
  };
  timestamp?: string;
  requestId?: string;
}

export const errorHandler = async (
  error: unknown,
  req: Request,
  res: Response,
  next?: NextFunction
): Promise<void> => {
  let errorResponse: ErrorResponse;
  let statusCode: number = 500;

  // Add request ID for tracing
  const requestId = (req.headers['x-request-id'] as string) || 'unknown';

  if (error instanceof MulterError) {
    statusCode = 400;
    errorResponse = {
      success: false,
      message: 'File upload error',
      error: {
        errorCode: `MULTER_${error.code.toUpperCase()}`,
        details: [
          {
            message:
              error.message || 'An unexpected file upload error occurred',
            field: error.field,
          },
        ],
      },
      timestamp: new Date().toISOString(),
      requestId,
    };
  } else if (error instanceof BaseError) {
    statusCode = error.statusCode;
    errorResponse = {
      success: false,
      message: error.message,
      error: error.toErrorModel(),
      timestamp: new Date().toISOString(),
      requestId,
    };
  } else if (error instanceof Error) {
    console.error('Unhandled error:', error);
    statusCode = 500;
    errorResponse = {
      success: false,
      message: 'Internal server error',
      error: {
        errorCode: 'INTERNAL_SERVER_ERROR',
        details: [
          {
            message:
              process.env.NODE_ENV === 'production'
                ? 'An unexpected error occurred'
                : error.message || 'An unexpected error occurred',
          },
        ],
      },
      timestamp: new Date().toISOString(),
      requestId,
    };
  } else {
    console.error('Unknown error type:', error);
    statusCode = 500;
    errorResponse = {
      success: false,
      message: 'Internal server error',
      error: {
        errorCode: 'UNKNOWN_ERROR',
        details: [{ message: 'An unknown error occurred' }],
      },
      timestamp: new Date().toISOString(),
      requestId,
    };
  }

  // Don't send error details in production for unknown errors
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    errorResponse.error.details = [{ message: 'Internal server error' }];
  }

  if (
    req.path.startsWith('/api/v1/auth') &&
    (errorResponse.error.errorCode?.includes('AUTHENTICATION_ERROR') ||
      statusCode === 401 ||
      errorResponse.error.errorCode?.includes('AUTHENTICATION'))
  ) {
    
    // Clear cookies if refresh fails
    clearCookies(res);
  }

  res.status(statusCode).json(errorResponse);
};
