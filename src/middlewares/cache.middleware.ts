import { Request, Response, NextFunction } from "express";
import { promisify } from "util";
import redisInstance from "@/shared/utils/redis";
import zlib from "zlib";
import { LoggingService } from "../services/observability/logging/logging.service";

const compress = promisify(zlib.gzip);
const decompress = promisify(zlib.gunzip);

const logger = LoggingService.getInstance();

interface CacheOptions {
  duration: number;
  sizeThreshold: number;
  keyPrefix?: string;
  includeQueryParams?: boolean;
}

export const cacheMiddleware = (options: CacheOptions) => {
  const { duration, sizeThreshold, keyPrefix = "cache", includeQueryParams = true } = options;
  
  return async (req: Request, res: Response, next: NextFunction) => {
    const redisClient = redisInstance.getClient();

    // Generate cache key
    const baseKey = `${keyPrefix}:${req.method}:${req.originalUrl}`;
    const queryString = includeQueryParams && req.query ? JSON.stringify(req.query) : "";
    const key = queryString ? `${baseKey}:${Buffer.from(queryString).toString('base64')}` : baseKey;

    try {
      // Handle GET requests - serve from cache
      if (req.method === "GET") {
        const cached = await redisClient.get(key);
        if (cached) {
          try {
            const decompressed = await decompress(Buffer.from(cached, 'base64'));
            const parsed = JSON.parse(decompressed.toString());
            
            logger.info(`Cache hit for key: ${key}`, { 
              key, 
              method: req.method, 
              url: req.originalUrl 
            });
            
            return res.json(parsed);
          } catch (decompressError) {
            logger.warn(`Failed to decompress cached data for key: ${key}`, { 
              error: decompressError, 
              key 
            });
            // Continue to fetch fresh data if decompression fails
          }
        }
      }

      // Handle cache invalidation for write operations
      if (["PUT", "PATCH", "DELETE"].includes(req.method)) {
        const resourceKey = `${keyPrefix}:GET:${req.originalUrl}`;
        
        if (req.method === "DELETE") {
          // Evict cache entry for DELETE
          await redisClient.del(resourceKey);
          logger.info(`Cache evicted for key: ${resourceKey}`, { key: resourceKey });
        } else {
          // Revalidate cache for PUT or PATCH
          const originalSend = res.send;
          res.send = function (body?: any) {
            const bodyString = JSON.stringify(body);
            const bodySize = Buffer.byteLength(bodyString, "utf-8");

            // Async cache update without blocking response
            (async () => {
              try {
                if (bodySize > sizeThreshold) {
                  const compressed = await compress(Buffer.from(bodyString, "utf-8"));
                  await redisClient.setEx(resourceKey, duration, compressed.toString("base64"));
                  logger.info(`Cache revalidated and compressed`, { 
                    key: resourceKey, 
                    size: bodySize, 
                    compressed: true 
                  });
                } else {
                  await redisClient.setEx(resourceKey, duration, bodyString);
                  logger.info(`Cache revalidated without compression`, { 
                    key: resourceKey, 
                    size: bodySize, 
                    compressed: false 
                  });
                }
              } catch (cacheError) {
                logger.error(`Failed to update cache for key: ${resourceKey}`, { 
                  error: cacheError, 
                  key: resourceKey 
                });
              }
            })();

            return originalSend.call(this, body);
          };
        }
      }

      // Handle GET requests - cache the response
      if (req.method === "GET") {
        const originalJson = res.json;
        res.json = function (body?: any) {
          const bodyString = JSON.stringify(body);
          const bodySize = Buffer.byteLength(bodyString, "utf-8");

          // Async cache storage without blocking response
          (async () => {
            try {
              if (bodySize > sizeThreshold) {
                const compressed = await compress(Buffer.from(bodyString, "utf-8"));
                await redisClient.setEx(key, duration, compressed.toString("base64"));
                logger.info(`Response cached and compressed`, { 
                  key, 
                  size: bodySize, 
                  compressed: true 
                });
              } else {
                await redisClient.setEx(key, duration, bodyString);
                logger.info(`Response cached without compression`, { 
                  key, 
                  size: bodySize, 
                  compressed: false 
                });
              }
            } catch (cacheError) {
              logger.error(`Failed to cache response for key: ${key}`, { 
                error: cacheError, 
                key 
              });
            }
          })();

          return originalJson.call(this, body);
        };
      }

      next();
    } catch (error) {
      logger.error(`Cache middleware error for key: ${key}`, { 
        error, 
        key, 
        method: req.method, 
        url: req.originalUrl 
      });
      // Continue without caching if Redis fails
      next();
    }
  };
};
