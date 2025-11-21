import type { RedisClient } from "bun";
import { getPresenceKey } from "./redis";

// Presence status types
export type PresenceStatus =
  | "available"
  | "away"
  | "on_break"
  | "busy"
  | "in_call"
  | "in_meeting"
  | "offline"
  | "dnd";

export type ManualStatus = "dnd" | "busy" | "away" | null;

// Presence data stored in Redis hash
export interface PresenceData {
  status: PresenceStatus;
  lastSeenAt: string; // unix timestamp in milliseconds
  orgId: string;
  punchedIn: "0" | "1";
  onBreak: "0" | "1";
  inCall: "0" | "1";
  inMeeting: "0" | "1";
  manualStatus: string; // "dnd" | "busy" | "away" | ""
}

// Input for computing presence status
export interface ComputePresenceInput {
  punchedIn: boolean;
  onBreak: boolean;
  inCall: boolean;
  inMeeting: boolean;
  isTabFocused: boolean;
  isIdle: boolean; // idle > 15 min
  manualStatus?: ManualStatus;
}

// TTL for presence keys in seconds (5 minutes)
const PRESENCE_TTL = 300;

/**
 * Computes the presence status based on priority order:
 * 1. Manual overrides (DND, Busy, Away)
 * 2. System states (Offline, On Break, In Call, In Meeting)
 * 3. Activity-based (Away if not focused or idle)
 * 4. Default (Available)
 */
export function computeStatus(input: ComputePresenceInput): PresenceStatus {
  // 1. Manual overrides
  if (input.manualStatus === "dnd") return "dnd";
  if (input.manualStatus === "busy") return "busy";
  if (input.manualStatus === "away") return "away";

  // 2. System states
  if (!input.punchedIn) return "offline";
  if (input.onBreak) return "on_break";
  if (input.inCall) return "in_call";
  if (input.inMeeting) return "in_meeting";

  // 3. Activity-based
  if (!input.isTabFocused) return "away";
  if (input.isIdle) return "away";

  // 4. Default
  return "available";
}

/**
 * Updates presence for a user in Redis
 */
export async function updatePresence(
  redis: RedisClient,
  userId: string,
  orgId: string,
  input: ComputePresenceInput
): Promise<PresenceStatus> {
  const status = computeStatus(input);
  const key = getPresenceKey(userId);
  const now = Date.now().toString();

  // Set hash fields using hset (hmset is deprecated)
  await redis.hset(key, {
    status,
    lastSeenAt: now,
    orgId,
    punchedIn: input.punchedIn ? "1" : "0",
    onBreak: input.onBreak ? "1" : "0",
    inCall: input.inCall ? "1" : "0",
    inMeeting: input.inMeeting ? "1" : "0",
    manualStatus: input.manualStatus || "",
  });

  // Set expiration
  await redis.expire(key, PRESENCE_TTL);

  return status;
}

/**
 * Sets manual status for a user
 */
export async function setManualStatus(
  redis: RedisClient,
  userId: string,
  orgId: string,
  manualStatus: ManualStatus
): Promise<void> {
  const key = getPresenceKey(userId);
  const now = Date.now().toString();

  // Update specific fields using hset (hmset is deprecated)
  await redis.hset(key, {
    manualStatus: manualStatus || "",
    lastSeenAt: now,
    orgId,
  });

  // Refresh expiration
  await redis.expire(key, PRESENCE_TTL);
}

/**
 * Gets presence for a single user
 */
export async function getPresence(
  redis: RedisClient,
  userId: string
): Promise<PresenceData | null> {
  const key = getPresenceKey(userId);
  const data = await redis.hgetall(key);

  if (!data || Object.keys(data).length === 0) {
    return null;
  }

  return data as unknown as PresenceData;
}

/**
 * Gets presence for multiple users
 */
export async function getPresenceForUsers(
  redis: RedisClient,
  userIds: string[]
): Promise<Record<string, PresenceData>> {
  if (userIds.length === 0) {
    return {};
  }

  const presenceMap: Record<string, PresenceData> = {};

  // Fetch all presence data in parallel
  const promises = userIds.map(async (userId) => {
    const key = getPresenceKey(userId);
    const data = await redis.hgetall(key);

    if (data && Object.keys(data).length > 0) {
      presenceMap[userId] = data as unknown as PresenceData;
    } else {
      // User is offline
      presenceMap[userId] = {
        status: "offline",
        lastSeenAt: "0",
        orgId: "",
        punchedIn: "0",
        onBreak: "0",
        inCall: "0",
        inMeeting: "0",
        manualStatus: "",
      };
    }
  });

  await Promise.all(promises);

  return presenceMap;
}
