import { z } from "zod";

// Work block schemas
export const WorkBlockSchema = z.object({
  id: z.string(),
  attendanceId: z.string(),
  userId: z.string(),
  organizationId: z.string(),
  startedAt: z.date(),
  endedAt: z.date().nullable(),
  durationMinutes: z.number().int().nullable(),
  endReason: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const StartBlockInput = z.object({
  attendanceId: z.string(),
  reason: z.string().optional(),
});

export const EndBlockInput = z.object({
  attendanceId: z.string(),
  endReason: z.string(),
});

export const StartBlockOutput = WorkBlockSchema;
export const EndBlockOutput = WorkBlockSchema;
