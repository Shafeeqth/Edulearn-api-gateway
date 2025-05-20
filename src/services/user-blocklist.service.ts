import { RedisClientType } from "redis";

export class UserBlockService {
  private readonly redisClient: RedisClientType;
  private readonly keyPrefix = "blocked_user:";
  private static instance: UserBlockService;

  constructor(redisClient?: RedisClientType) {
    if (!UserBlockService.instance) {
      if (!redisClient) throw Error("Must provide redisClient first time");

      this.redisClient = redisClient;
      UserBlockService.instance = this;
    }
    UserBlockService.instance;
  }

  /**
   * Add a user to the blocklist (by userId)
   * @param userId string
   * @param ttlSeconds number (optional, default: 30 days)
   */
  async blockUser(
    userId: string,
    ttlSeconds = 60 * 60 * 24 * 30
  ): Promise<void> {
    await this.redisClient.set(this.keyPrefix + userId, "1", {
      EX: ttlSeconds,
    });
  }

  /**
   * Remove a user from the blocklist
   */
  async unblockUser(userId: string): Promise<void> {
    await this.redisClient.del(this.keyPrefix + userId);
  }

  /**
   * Check if a user is blocked
   */
  async isUserBlocked(userId: string): Promise<boolean> {
    const result = await this.redisClient.get(this.keyPrefix + userId);
    return result === "1";
  }

  async getAllBlockedUsers(): Promise<string[]> {
    const keys = await this.redisClient.keys(this.keyPrefix + "*");
    return keys.map((k) => k.replace(this.keyPrefix, ""));
  }
}
