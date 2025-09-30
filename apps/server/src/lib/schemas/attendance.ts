import { z } from "zod";
import { AttendanceSchema } from "@/lib/schemas/db-tables";

const MemberPunchBaseInput = z.object({
  note: z.string().trim().max(500).optional(),
  location: z.string().trim().max(255).optional(),
});

export const MemberPunchInInput = MemberPunchBaseInput;

export const MemberPunchOutInput = MemberPunchBaseInput;

const MemberPunchResponse = AttendanceSchema.pick({
  id: true,
  userId: true,
  organizationId: true,
  teamId: true,
  date: true,
  status: true,
  checkInTime: true,
  checkOutTime: true,
  clockInMethod: true,
  clockOutMethod: true,
  location: true,
  coordinates: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
});

export const MemberPunchInOutput = MemberPunchResponse;

export const MemberPunchOutOutput = MemberPunchResponse;

export const MemberAttendanceStatusOutput = MemberPunchResponse;
