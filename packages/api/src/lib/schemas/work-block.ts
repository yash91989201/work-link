import {
  WorkBlockInsertSchema,
  WorkBlockSchema,
} from "@work-link/db/lib/schemas/db-tables";
import { z } from "zod";

export const StartBlockInput = WorkBlockInsertSchema.pick({
  attendanceId: true,
}).extend({
  reason: z.string().optional(),
});

export const EndBlockInput = z.object({
  attendanceId: z.string(),
  endReason: z.enum(["manual", "break", "punch_out", "idle_timeout"]),
});

export const StartBlockOutput = WorkBlockSchema;
export const EndBlockOutput = WorkBlockSchema;

export const GetActiveBlockInput = z.object({
  attendanceId: z.string(),
});

export const GetActiveBlockOutput = WorkBlockSchema.nullable();

export const ListBlocksInput = z.object({
  attendanceId: z.string(),
});

export const ListBlocksOutput = z.array(WorkBlockSchema);
