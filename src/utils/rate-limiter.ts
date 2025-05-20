import { RateLimiterRedis } from "rate-limiter-flexible";
import RedisService from "./redis";
import redisClient from "./redis";

export interface RateLimiterConfig {
  keyPrefix?: string;
  points?: number;
  duration?: number;
}

export const defaultRateLimiterConfig: RateLimiterConfig = {
  keyPrefix: "api_gateway-rate-limit",
  points: 100,
  duration: 60,
};

export class RateLimiter {
  private limiter: RateLimiterRedis;

  constructor(config: RateLimiterConfig = {}) {
    const limiterConfig = { ...defaultRateLimiterConfig, ...config };
    this.limiter = new RateLimiterRedis({
      storeClient: redisClient.getClient(),
      keyPrefix: limiterConfig.keyPrefix,
      points: limiterConfig.points,
      duration: limiterConfig.duration,
    });
  }

  async consume(key: string): Promise<void> {
    await this.limiter.consume(key).catch((e) => {
      console.error("Error in Rate limiter :(", e);
      throw e;
    });
  }
}
