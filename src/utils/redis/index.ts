import { createClient, RedisClientType } from "redis";
import { config } from "../../config";

class RedisService {
  private static instance: RedisService;
  private client: RedisClientType;

  private constructor() {
    this.client = createClient({
      url: config.redisUrl,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 5) return false;
          return Math.max(retries * 100, 3000);
        }, // Retry logic
      },
    });

    this.client.on("error", (error) => {
      console.error("Redis Client Error :(", error);
    });

    this.client.on("connect", () => {
      console.log("Redis client connected successfully (:)");
    });

    this.client.on("end", () => {
      console.log("Redis client disconnected (:)");
    });
  }

  public static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }
    return RedisService.instance;
  }

  public async connect(): Promise<void> {
    try {
      await this.client.connect();
      console.log("Redis client connected..")
    } catch (error) {
      console.error("Failed to connect to Redis :(", error);
      throw error;
    }
  }

  public getClient(): RedisClientType {
    return this.client;
  }

  public async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      console.log("Redis client disconnected gracefully (:)");
    }
  }
}

// Graceful shutdown
process.on("SIGINT", async () => {
  const redisService = RedisService.getInstance();
  await redisService.disconnect();
  process.exit(0);
});

const redisClient = RedisService.getInstance();
export default redisClient;
