import { Request, Response, NextFunction } from "express";
import { promisify } from "util";
import redisInstance from "utils/redis";
import zlib from "zlib";

const compress = promisify(zlib.gzip);
const decompress = promisify(zlib.gunzip);

export const cacheMiddleware =
  (duration: number, sizeThreshold: number) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const redisClient = redisInstance.getClient();

    const key = `cache:${req.method}:${req.originalUrl}`;
    console.log("Cache key ", key);

    if (req.method === "GET") {
      const cached = await redisClient.get(key); // Use getBuffer for binary data
      if (cached) {
        const decompressed = await decompress(cached);
        return res.json(JSON.parse(decompressed.toString()));
      }
    }

    if (["PUT", "PATCH", "DELETE"].includes(req.method)) {
      const resourceKey = `cache:GET:${req.originalUrl}`;
      if (req.method === "DELETE") {
        // Evict cache entry for DELETE
        await redisClient.del(resourceKey);
        console.log(`Cache evicted for key: ${resourceKey}`);
      } else {
        // Revalidate cache for PUT or PATCH
        const originSend = res.send;
        res.send = function (body?: any) {
          const bodyString = JSON.stringify(body);
          const bodySize = Buffer.byteLength(bodyString, "utf-8");

          (async () => {
            if (bodySize > sizeThreshold) {
              const compressed = await compress(Buffer.from(bodyString, "utf-8"));
              await redisClient.setEx(resourceKey, duration, compressed.toString("base64")); // Store compressed data
              console.log(`Cache revalidated and compressed (size: ${bodySize} bytes)`);
            } else {
              await redisClient.setEx(resourceKey, duration, bodyString); // Store uncompressed data
              console.log(`Cache revalidated without compression (size: ${bodySize} bytes)`);
            }
          })();

          originSend.call(this, body);
          return this;
        };
      }
    }

    next();
  };
