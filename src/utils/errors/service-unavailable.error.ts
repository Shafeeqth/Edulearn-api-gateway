import { BaseError, ErrorStatusCodes } from "@mdshafeeq-repo/edulearn-common";

export class ServiceNotAvailableError extends BaseError {
  statusCode = ErrorStatusCodes.UNAVAILABLE;
  errorCode = "SERVICE_NOT_AVAILABLE";

  constructor(public message: string = "Service is currently unavailable", reason?: string ) {
	super(message);
	Object.setPrototypeOf(this, ServiceNotAvailableError.prototype);
  }

  serializeErrors() {
	return [{ message: this.message }];
  }
}