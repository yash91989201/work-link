import Redis from "ioredis";
import type { RedisClient } from "@/lib/services/redis";

// Create Redis client instance
// This should be initialized based on environment variables
export function createRedisClient(): RedisClient {
  const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

  const redis = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    lazyConnect: true, // Don't connect immediately in case Redis is not available
  });

  redis.on("error", (err) => {
    console.error("Redis Client Error:", err);
  });

  return redis;
}

// Singleton instance
let redisClient: RedisClient | null = null;

export function getRedisClient(): RedisClient {
  if (!redisClient) {
    redisClient = createRedisClient();
  }
  return redisClient;
}

// Graceful shutdown
export async function closeRedisClient(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}
