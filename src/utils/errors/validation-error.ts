import {
  BaseError,
  ErrorCodes,
  ErrorStatusCodes,
} from "@mdshafeeq-repo/edulearn-common";
import { ZodError } from "zod";

export class ValidationError extends BaseError {
  errorCode: ErrorCodes.VALIDATION_ERROR = ErrorCodes.VALIDATION_ERROR;
  statusCode: ErrorStatusCodes.VALIDATION_ERROR =
    ErrorStatusCodes.VALIDATION_ERROR;

  constructor(private errors: ZodError) {
    super(
      `Invalid request parameters at '${errors.errors[0]?.path}' received '${errors.errors[0]}'`
    );

    Object.setPrototypeOf(this, this.constructor.prototype);
  }

  serializeErrors(): { message: string; field?: string }[] {
    return this.errors.issues.map((err) => {
      return { message: err.message, field: String(err.path) };
    });
  }
}
