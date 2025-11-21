import { RedisClient } from "bun";
import { env } from "@/env";

export function createRedisClient(): RedisClient {
  const redisUrl = env.REDIS_URL;

  const redis = new RedisClient(redisUrl);

  return redis;
}

let redisClient: RedisClient | null = null;

export function getRedisClient(): RedisClient {
  if (!redisClient) {
    redisClient = createRedisClient();
  }
  return redisClient;
}

export function closeRedisClient(): void {
  if (redisClient) {
    redisClient.close();
    redisClient = null;
  }
}

export const PRESENCE_KEY_PREFIX = "presence:user:";

export function getPresenceKey(userId: string): string {
  return `${PRESENCE_KEY_PREFIX}${userId}`;
}
