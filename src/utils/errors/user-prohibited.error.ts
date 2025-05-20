import {
  BaseError,
  ErrorCodes,
  ErrorStatusCodes,
} from "@mdshafeeq-repo/edulearn-common";

export class UserProhibitedError extends BaseError {
  errorCode: ErrorCodes.PERMISSION_DENIED = ErrorCodes.PERMISSION_DENIED;
  statusCode: ErrorStatusCodes.PERMISSION_DENIED =
    ErrorStatusCodes.PERMISSION_DENIED;

  public constructor(message?: string) {
    super(message || "User has been prohibited to access the resource");

    Object.setPrototypeOf(this, this.constructor.prototype);
  }

  serializeErrors(): { message: string; field?: string }[] {
    return [
      {
        message:
          "User has been prohibited to access the resources, please reach out to admin",
      },
    ];
  }
}
