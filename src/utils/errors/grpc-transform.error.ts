import { ServiceError, status } from "@grpc/grpc-js";
import { BaseError } from "@mdshafeeq-repo/edulearn-common";

export class GrpcTransformedError extends BaseError {
  public statusCode: number;
  public requestId?: string;
  public errorCode: string;
  details: { message: string; field?: string }[];
  timestamp: string;
  documentation?: string;

  constructor(error: ServiceError, requestId?: string) {
    super(error.details);
    this.name = error.name;
    this.stack = error.stack;
    this.statusCode = this.mapGrpcStatusToHttpStatus(error.code);
    this.errorCode = this.parseErrorCode(error);
    this.details = this.parseDetails(error);
    this.requestId = requestId;
    this.timestamp = this.parseErrorTimestamp(error);
    this.documentation = `https://api.example.com/docs/errors#${this.errorCode}`;
  }

  serializeErrors(): { message: string; field?: string }[] {
    return this.details;
  }

  toJSON() {
    return {
      errorCode: this.errorCode,
      message: this.message,
      details: this.serializeErrors(),
      requestId: this.requestId,
      timestamp: this.timestamp,
      documentation: this.documentation,
    };
  }
  private parseErrorTimestamp(error: ServiceError) {
    const date = error.metadata?.get("date")?.[0];
    if (date) {
      try {
        return JSON.parse(date.toString());
      } catch {
        return date.toString();
      }
    }
    return new Date().toISOString();
  }
  private parseErrorCode(error: ServiceError) {
    const errorCode = error.metadata?.get("error_code")?.[0];
    if (errorCode) {
      try {
        return JSON.parse(errorCode.toString());
      } catch {
        return errorCode.toString();
      }
    }
    return "UNKNOWN_ERROR";
  }

  private parseDetails(
    error: ServiceError
  ): { message: string; field?: string }[] {
    const details = error.metadata?.get("error_details")?.[0];
    if (details) {
      try {
        return JSON.parse(details.toString());
      } catch {
        return [{ message: error.details || error.message }];
      }
    }
    return [{ message: error.details || error.message }];
  }

  mapGrpcStatusToHttpStatus = (grpcStatus: status): number => {
    const statusMap: { [key in status]?: number } = {
      [status.OK]: 200,
      [status.INVALID_ARGUMENT]: 400,
      [status.NOT_FOUND]: 404,
      [status.ALREADY_EXISTS]: 409,
      [status.PERMISSION_DENIED]: 403,
      [status.UNAUTHENTICATED]: 401,
      [status.RESOURCE_EXHAUSTED]: 429,
      [status.FAILED_PRECONDITION]: 412,
      [status.ABORTED]: 409,
      [status.DEADLINE_EXCEEDED]: 504,
      [status.INTERNAL]: 500,
      [status.UNAVAILABLE]: 503,
      [status.DATA_LOSS]: 500,
      [status.UNKNOWN]: 500,
    };
    return statusMap[grpcStatus] || 500;
  };
}
