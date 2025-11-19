import { z } from "zod";

// Presence status enum
export const PresenceStatusSchema = z.enum([
  "available",
  "away",
  "on_break",
  "busy",
  "in_call",
  "in_meeting",
  "offline",
  "dnd",
]);

export const ManualStatusSchema = z.enum(["dnd", "busy", "away"]).nullable();

// Heartbeat input
export const HeartbeatInput = z.object({
  orgId: z.string(),
  punchedIn: z.boolean(),
  onBreak: z.boolean(),
  inCall: z.boolean(),
  inMeeting: z.boolean(),
  isTabFocused: z.boolean(),
  isIdle: z.boolean(),
  manualStatus: ManualStatusSchema.optional(),
});

export const HeartbeatOutput = z.object({
  status: PresenceStatusSchema,
});

// Set manual status input
export const SetManualStatusInput = z.object({
  orgId: z.string(),
  status: ManualStatusSchema,
});

export const SetManualStatusOutput = z.object({
  ok: z.boolean(),
});

// Get org presence input
export const GetOrgPresenceInput = z.object({
  orgId: z.string(),
});

export const PresenceDataSchema = z.object({
  status: PresenceStatusSchema,
  lastSeenAt: z.string(),
  orgId: z.string(),
  punchedIn: z.string(),
  onBreak: z.string(),
  inCall: z.string(),
  inMeeting: z.string(),
  manualStatus: z.string(),
});

export const GetOrgPresenceOutput = z.object({
  presence: z.record(z.string(), PresenceDataSchema),
});
