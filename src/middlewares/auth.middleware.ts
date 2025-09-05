import { config } from '@/config';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticationError } from '@/shared/utils/errors/unauthenticate.error';

type JwtPayload = {
  username: string;
  email: string;
  userId: string;
  role: string;
  avatar?: string;
} & StandardJwtClaims;

export interface StandardJwtClaims {
  iat: number;
  iss: string;
  aud: string;
  jti: string;
  exp?: number;
  sub?: string;
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    throw new AuthenticationError(
      'Authentication failed: Token is missing or invalid.'
    );
  }

  try {
    const decoded = jwt.verify(token, config.accessTokenSecret) as JwtPayload;
    req.user = {
      userId: decoded.userId,
      username: decoded.username,
      avatar: decoded.avatar,
      role: decoded.role,
      email: decoded.email,
    };
    req.authToken = req.headers.authorization;
  } catch (error) {
    next(new AuthenticationError('Authentication failed! Invalid token.'));
  }
  next();
};

export const authorize =
  (roles: string[]) => (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new Error('Unauthorized error');
    }
    next();
  };
