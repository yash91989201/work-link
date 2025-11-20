import { RedisClient } from "bun";

// Create Redis client instance using Bun's built-in Redis client
// This should be initialized based on environment variables
export function createRedisClient(): RedisClient {
  const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

  // Bun's native Redis client
  const redis = new RedisClient(redisUrl);

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
export function closeRedisClient(): void {
  if (redisClient) {
    redisClient.close();
    redisClient = null;
  }
}

// Redis key patterns
export const PRESENCE_KEY_PREFIX = "presence:user:";

export function getPresenceKey(userId: string): string {
  return `${PRESENCE_KEY_PREFIX}${userId}`;
}
