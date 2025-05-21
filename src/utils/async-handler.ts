import { Request, Response, NextFunction } from "express";

type ErrorHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => any;

export const asyncHandler =
  (handler: ErrorHandler) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return await handler(req, res, next);
    } catch (error) {
      next(error);
    }
  };
