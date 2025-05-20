import { Request, Response, NextFunction } from "express";
import redisClient from "../utils/redis";
import { AuthenticationError } from "../utils/errors/unauthenticate.error";
import { UserBlockService } from "../services/user-blocklist.service";
import { UserProhibitedError } from "../utils/errors/user-prohibited.error";

const blocklistService = new UserBlockService(redisClient.getClient());

export async function blocklistMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = req.user;
  if (!user || !user.userId) {
    throw new AuthenticationError();
  }
  const isBlocked = await blocklistService.isUserBlocked(user.userId);
  if (isBlocked) {
    throw new UserProhibitedError();
  }
  next();
}
