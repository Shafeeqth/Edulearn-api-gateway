import { Request, Response, NextFunction } from "express";
import { GrpcTransformedError } from "./errors/grpc-transform.error";
import { ValidationError } from "./errors/validation-error";
import { BaseError } from "@mdshafeeq-repo/edulearn-common";
import { MulterError } from "multer";

const ResponseStatus = {
  success: "success",
  error: "error",
} as const;

export const errorHandler = async (
  error: unknown,
  req: Request,
  res: Response,
  next?: NextFunction
) => {
  let errorResponse;
  let statusCode: number;

  if (error instanceof MulterError) {
    console.error(error);
    errorResponse = {
      status: ResponseStatus.error,
      message: error.message,
      error: {
        errorCode: error.code,
        message: error.message,
        details: [
          {
            message: error.message || "An unexpected Multer error has occurred",
            field: error.field
          },
        ],
      },
    };
  } else if (error instanceof BaseError) {
    error.logError();
    statusCode = error.statusCode;
    errorResponse = {
      status: ResponseStatus.error,
      message: error.message,
      error: error.toJSON(),
    };
  } else if (error instanceof Error) {
    errorResponse = {
      status: ResponseStatus.error,
      error: {
        errorCode: "INTERNAL_SERVER_ERROR",
        message: error.message,
        details: [{ message: error.message || "An unexpected error occurred" }],
      },
    };
  }
  res.status((statusCode ??= 400)).json(errorResponse);
};
