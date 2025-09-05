export {};

declare global {
  namespace Express {
    interface Request {
      correlationId?: string;
      authToken?: string;
      user?: {
        userId: string;
        role: string;
        email: string;
        username: string;
        avatar?: string;
      };
    }
  }
}
