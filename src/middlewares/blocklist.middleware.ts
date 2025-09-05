import { Request, Response, NextFunction } from 'express';
import { AuthenticationError } from '@/shared/utils/errors/unauthenticate.error';
import { UserBlockService } from '@/services/user-blocklist.service';
import { UserProhibitedError } from '@/shared/utils/errors/user-prohibited.error';

const blocklistService = UserBlockService.getInstance();

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
