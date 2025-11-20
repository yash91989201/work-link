import {
  AttendanceInsertSchema,
  AttendanceSchema,
  AttendanceUpdateSchema,
} from "@work-link/db/lib/schemas/db-tables";
import { z } from "zod";

// Derive input schemas from database schemas
const MemberPunchBaseInput = AttendanceInsertSchema.pick({
  notes: true,
  location: true,
}).partial();

export const MemberPunchInInput = MemberPunchBaseInput;

export const MemberPunchOutInput = MemberPunchBaseInput;

export const MemberPunchInOutput = AttendanceSchema;

export const MemberPunchOutOutput = AttendanceSchema;

export const MemberAttendanceStatusOutput = AttendanceSchema;

// Add break duration input - derive from update schema
export const AddBreakDurationInput = AttendanceSchema.pick({
  id: true,
}).extend({
  minutes: z.number().int().min(0).max(480), // Max 8 hours
});

export const AddBreakDurationOutput = AttendanceUpdateSchema.pick({
  breakDuration: true,
}).required();

// Get today's attendance input
export const GetTodayInput = z.object({
  orgId: z.string(),
});

export const GetTodayOutput = AttendanceSchema.nullable();
