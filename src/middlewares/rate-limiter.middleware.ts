import { Request, Response, NextFunction } from "express";
import { RateLimiter } from "@/shared/utils/rate-limiter";

export interface RateLimiterMiddlewareOptions {
  points?: number; // max requests
  duration?: number; // per duration in seconds
  keyPrefix?: string;
  getKey?: (req: Request) => string; // function to extract unique key (e.g., IP)
}

export function rateLimiter(options: RateLimiterMiddlewareOptions = {}) {
  const limiter = new RateLimiter({
    points: options.points,
    duration: options.duration,
    keyPrefix: options.keyPrefix,
  });
  const getKey = options.getKey || ((req) => req.ip);

  return async (req: Request, res: Response, next: NextFunction) => {
    const key = req.user?.userId || getKey(req);
    console.info("rate-limiter-key -> " + key);
    try {
      await limiter.consume(key!);
      // Optionally, set rate limit headers
      res.setHeader("X-RateLimit-Limit", options.points || 100);

      next();
    } catch (err: any) {
      // Too Many Requests
      res.setHeader("Retry-After", options.duration?.toString() || "60");
      res.status(429).json({
        status: "error",
        error: {
          errorCode: "TOO_MANY_REQUESTS",
          message: "Too many requests, please try again later.",
        },
      });

      console.warn(`Rate limit exceeded for key: ${key}`);
    }
  };
}
