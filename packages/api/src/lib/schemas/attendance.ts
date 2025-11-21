import { AttendanceSchema } from "@work-link/db/lib/schemas/db-tables";
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

export const attendanceStatuses = [
  "present",
  "absent",
  "late",
  "excused",
  "partial",
  "holiday",
  "sick_leave",
  "work_from_home",
] as const;

const AttendanceStatusEnum = z.enum(attendanceStatuses);

export const AttendanceAnalyticsInput = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const AttendanceAnalyticsOutput = z.object({
  range: z.object({
    startDate: z.string(),
    endDate: z.string(),
  }),
  summary: z.object({
    totalDays: z.number(),
    presentDays: z.number(),
    absentDays: z.number(),
    lateDays: z.number(),
    remoteDays: z.number(),
    excusedDays: z.number(),
    attendanceRate: z.number(),
    averageDailyHours: z.number(),
    averageBreakMinutes: z.number(),
    totalHours: z.number(),
    overtimeHours: z.number(),
  }),
  statusBreakdown: z.array(
    z.object({
      status: AttendanceStatusEnum,
      count: z.number(),
    })
  ),
  dailyTrends: z.array(
    z.object({
      date: z.string(),
      status: AttendanceStatusEnum,
      totalHours: z.number().nullable(),
      breakMinutes: z.number().nullable(),
      checkInTime: z.string().nullable(),
      checkOutTime: z.string().nullable(),
    })
  ),
  punctuality: z.object({
    averageCheckInTime: z.string().nullable(),
    averageCheckOutTime: z.string().nullable(),
    earliestCheckIn: z.string().nullable(),
    latestCheckOut: z.string().nullable(),
  }),
  streaks: z.object({
    currentStreak: z.number(),
    longestStreak: z.number(),
  }),
});

export type AttendanceStatus = (typeof attendanceStatuses)[number];
