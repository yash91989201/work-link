import {
  AttendanceInsertSchema,
  AttendanceSchema,
  AttendanceUpdateSchema,
} from "@work-link/db/lib/schemas/db-tables";
import { z } from "zod";

// Derive input schemas from database schemas
const MemberPunchBaseInput = z.object({
  note: z.string().trim().max(500).optional(),
  location: z.string().trim().max(255).optional(),
});

export const MemberPunchInInput = MemberPunchBaseInput;

export const MemberPunchOutInput = MemberPunchBaseInput;

export const MemberPunchInOutput = AttendanceSchema;

export const MemberPunchOutOutput = AttendanceSchema;

export const MemberAttendanceStatusOutput = AttendanceSchema;

// Add break duration input - using custom schema for API consistency
export const AddBreakDurationInput = z.object({
  attendanceId: z.string(),
  minutes: z.number().int().min(0).max(480), // Max 8 hours
});

export const AddBreakDurationOutput = z.object({
  breakDuration: z.number().int(),
});

// Get today's attendance input
export const GetTodayInput = z.object({
  orgId: z.string(),
});

export const GetTodayOutput = AttendanceSchema.nullable();
