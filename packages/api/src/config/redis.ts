import type { RedisClient } from "@/lib/services/redis";

// Create Redis client instance using Bun's built-in Redis client
// This should be initialized based on environment variables
export function createRedisClient(): RedisClient {
  const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

  // Bun's native Redis client
  const redis = new Redis({
    url: redisUrl,
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
