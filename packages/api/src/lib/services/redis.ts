import type { Redis } from "ioredis";

// Placeholder for Redis client - will be initialized in context
// This file provides types and helper functions for Redis operations
export type RedisClient = Redis;

// Redis key patterns
export const PRESENCE_KEY_PREFIX = "presence:user:";

export function getPresenceKey(userId: string): string {
  return `${PRESENCE_KEY_PREFIX}${userId}`;
}
