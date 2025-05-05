import {
  BaseError,
  ErrorCodes,
  ErrorStatusCodes,
} from "@mdshafeeq-repo/edulearn-common";

export class AuthenticationError extends BaseError {
  errorCode: ErrorCodes.AUTHENTICATION_ERROR = ErrorCodes.AUTHENTICATION_ERROR;
  statusCode: ErrorStatusCodes.AUTHENTICATION_ERROR =
    ErrorStatusCodes.AUTHENTICATION_ERROR;

  public constructor(message?: string) {
    super(message || "Authentication failed");

    Object.setPrototypeOf(this, this.constructor.prototype);
  }

  serializeErrors(): { message: string; field?: string }[] {
    return [
      {
        message: "Please check your credentials and try again",
      },
    ];
  }
}
