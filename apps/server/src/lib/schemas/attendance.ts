import { z } from "zod";
import { AttendanceSchema } from "@/lib/schemas/db-tables";

const MemberPunchBaseInput = z.object({
  note: z.string().trim().max(500).optional(),
  location: z.string().trim().max(255).optional(),
});

export const MemberPunchInInput = MemberPunchBaseInput;

export const MemberPunchOutInput = MemberPunchBaseInput;

export const MemberPunchInOutput = AttendanceSchema;

export const MemberPunchOutOutput = AttendanceSchema;

export const MemberAttendanceStatusOutput = AttendanceSchema;
