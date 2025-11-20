// Placeholder for Redis client - will be initialized in context
// This file provides types and helper functions for Redis operations
// Using Bun's built-in Redis client
export type RedisClient = typeof Redis.prototype;

// Redis key patterns
export const PRESENCE_KEY_PREFIX = "presence:user:";

export function getPresenceKey(userId: string): string {
  return `${PRESENCE_KEY_PREFIX}${userId}`;
}
