import { attendanceTable } from "@work-link/db/schema/index";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Base attendance schema from database
export const AttendanceSelectSchema = createSelectSchema(attendanceTable);

// Get attendance stats input/output
export const GetAttendanceStatsInput = z.object({});

export const GetAttendanceStatsOutput = z.object({
  totalMembers: z.number(),
  presentToday: z.number(),
});

export type GetAttendanceStatsInputType = z.infer<
  typeof GetAttendanceStatsInput
>;
export type GetAttendanceStatsOutputType = z.infer<
  typeof GetAttendanceStatsOutput
>;

// List attendance records input/output
export const ListAttendanceRecordsInput = z.object({
  page: z.number().min(1).default(1),
  perPage: z.number().min(1).max(100).default(10),
  search: z.string().optional(),
  date: z.string().optional(), // ISO date string (for single date)
  startDate: z.string().optional(), // ISO date string (for date range)
  endDate: z.string().optional(), // ISO date string (for date range)
  status: z
    .enum([
      "present",
      "absent",
      "late",
      "excused",
      "partial",
      "holiday",
      "sick_leave",
      "work_from_home",
    ])
    .optional(),
});

export const AttendanceRecordWithUser = AttendanceSelectSchema.extend({
  user: z.object({
    id: z.string(),
    name: z.string().nullable(),
    email: z.string(),
    image: z.string().nullable(),
  }),
});

export const ListAttendanceRecordsOutput = z.object({
  records: z.array(AttendanceRecordWithUser),
  pagination: z.object({
    page: z.number(),
    perPage: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

export type ListAttendanceRecordsInputType = z.infer<
  typeof ListAttendanceRecordsInput
>;
export type ListAttendanceRecordsOutputType = z.infer<
  typeof ListAttendanceRecordsOutput
>;

// Get attendance detail input/output
export const GetAttendanceDetailInput = z.object({
  attendanceId: z.string(),
});

export const GetAttendanceDetailOutput = AttendanceRecordWithUser.extend({
  workBlocks: z.array(
    z.object({
      id: z.string(),
      startedAt: z.date(),
      endedAt: z.date().nullable(),
      durationMinutes: z.number().nullable(),
      endReason: z
        .enum(["manual", "break", "punch_out", "idle_timeout"])
        .nullable(),
    })
  ),
}).optional();

export type GetAttendanceDetailInputType = z.infer<
  typeof GetAttendanceDetailInput
>;
export type GetAttendanceDetailOutputType = z.infer<
  typeof GetAttendanceDetailOutput
>;
