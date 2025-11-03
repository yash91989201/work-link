import { ORPCError } from "@orpc/server";
import type { AttendanceUpdateType } from "@work-link/db/lib/types";
import { attendanceTable, member } from "@work-link/db/schema/index";
import { and, eq } from "drizzle-orm";
import { protectedProcedure } from "@/index";
import {
  MemberAttendanceStatusOutput,
  MemberPunchInInput,
  MemberPunchInOutput,
  MemberPunchOutInput,
  MemberPunchOutOutput,
} from "@/lib/schemas/attendance";

export const memberAttendanceRouter = {
  punchIn: protectedProcedure
    .input(MemberPunchInInput)
    .output(MemberPunchInOutput)
    .handler(async ({ input, context: { db, session } }) => {
      const user = session.user;
      const orgId = session.session.activeOrganizationId;
      const teamId = session.session.activeTeamId ?? null;

      const now = new Date();

      if (orgId == null) {
        throw new ORPCError("NOT_FOUND", {
          message: "Organization not found.",
        });
      }

      const existingAttendance = await db.query.attendanceTable.findFirst({
        where: and(
          eq(attendanceTable.organizationId, orgId),
          eq(attendanceTable.userId, user.id),
          eq(attendanceTable.date, now),
          eq(attendanceTable.isDeleted, false)
        ),
      });

      if (existingAttendance !== undefined) {
        return existingAttendance;
      }

      const [attendance] = await db
        .insert(attendanceTable)
        .values({
          userId: user.id,
          organizationId: orgId,
          teamId,
          date: now,
          status: "present",
          checkInTime: now,
          clockInMethod: "manual",
          notes: input.note ?? null,
          location: input.location ?? null,
          isManualEntry: true,
        })
        .returning();

      if (!attendance) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to create attendance record.",
        });
      }

      return attendance;
    }),

  punchOut: protectedProcedure
    .input(MemberPunchOutInput)
    .output(MemberPunchOutOutput)
    .handler(async ({ input, context }) => {
      const { db, session } = context;
      const user = session.user;
      const orgId = session.session.activeOrganizationId;
      const now = new Date();

      if (orgId == null) {
        throw new ORPCError("NOT_FOUND", {
          message: "Organization not found.",
        });
      }

      const attendance = await db.query.attendanceTable.findFirst({
        where: and(
          eq(attendanceTable.organizationId, orgId),
          eq(attendanceTable.userId, user.id),
          eq(attendanceTable.date, now),
          eq(attendanceTable.isDeleted, false)
        ),
      });

      if (attendance === undefined) {
        throw new ORPCError("CONFLICT", {
          message: "You need to punch in before you can punch out.",
        });
      }

      const updatePayload: Partial<AttendanceUpdateType> = {
        checkOutTime: now,
        clockOutMethod: "manual",
      };

      if (input.note !== undefined) {
        updatePayload.notes = input.note;
      }

      if (input.location !== undefined) {
        updatePayload.location = input.location;
      }

      const [updatedAttendance] = await db
        .update(attendanceTable)
        .set(updatePayload)
        .where(eq(attendanceTable.id, attendance.id))
        .returning();

      if (!updatedAttendance) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to update attendance record.",
        });
      }

      return updatedAttendance;
    }),

  getStatus: protectedProcedure
    .output(MemberAttendanceStatusOutput.nullable())
    .handler(async ({ context }) => {
      const { db, session } = context;
      const user = session.user;
      const orgId = session.session.activeOrganizationId;

      if (orgId == null) {
        throw new ORPCError("NOT_FOUND", {
          message: "Organization not found.",
        });
      }

      const membership = await db.query.member.findFirst({
        columns: { id: true },
        where: and(
          eq(member.organizationId, orgId),
          eq(member.userId, user.id)
        ),
      });

      if (membership == null) {
        throw new ORPCError("FORBIDDEN", {
          message: "You are not a member of this organization.",
        });
      }

      const today = new Date();

      const attendance = await db.query.attendanceTable.findFirst({
        where: and(
          eq(attendanceTable.organizationId, orgId),
          eq(attendanceTable.userId, user.id),
          eq(attendanceTable.date, today),
          eq(attendanceTable.isDeleted, false)
        ),
      });

      if (attendance == null) {
        return null;
      }

      return attendance;
    }),
};
