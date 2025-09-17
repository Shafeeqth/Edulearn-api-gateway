import { ZodError } from 'zod';
import { BaseError } from './base-error';
import { ErrorCodes } from './error-codes';
import { ErrorStatusCodes } from './error-status-codes';

export class ValidationError extends BaseError {
  errorCode: ErrorCodes.VALIDATION_ERROR = ErrorCodes.VALIDATION_ERROR;
  statusCode: ErrorStatusCodes.VALIDATION_ERROR =
    ErrorStatusCodes.VALIDATION_ERROR;

  constructor(private errors: ZodError) {
    super(
      `Invalid request parameters at path '${errors.errors[0]?.path}' but received '${(errors.issues[0] as any)?.received}'`
    );

    Object.setPrototypeOf(this, this.constructor.prototype);
  }

  serializeErrors(): { message: string; field?: string }[] {
    return this.errors.issues.map(err => {
      return { message: err.message, field: String(err.path) };
    });
  }
}
