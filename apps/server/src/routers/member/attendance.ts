import { ORPCError } from "@orpc/server";
import { and, eq } from "drizzle-orm";
import { attendanceTable, member } from "@/db/schema";
import { protectedProcedure } from "@/lib/orpc";
import {
  MemberAttendanceStatusOutput,
  MemberPunchInInput,
  MemberPunchInOutput,
  MemberPunchOutInput,
  MemberPunchOutOutput,
} from "@/lib/schemas/attendance";
import type { AttendanceUpdateType } from "@/lib/types";

export const memberAttendanceRouter = {
  punchIn: protectedProcedure
    .input(MemberPunchInInput)
    .output(MemberPunchInOutput)
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

      const existingAttendance = await db.query.attendanceTable.findFirst({
        where: and(
          eq(attendanceTable.organizationId, orgId),
          eq(attendanceTable.userId, user.id),
          eq(attendanceTable.date, now),
          eq(attendanceTable.isDeleted, false)
        ),
      });

      if (existingAttendance?.checkInTime != null) {
        throw new ORPCError("CONFLICT", {
          message: "You have already punched in today.",
        });
      }

      const teamId = session.session.activeTeamId ?? null;

      if (existingAttendance != null) {
        const updatePayload: Partial<AttendanceUpdateType> = {
          checkInTime: now,
          clockInMethod: "manual",
        };

        if (input.note !== undefined) {
          updatePayload.notes = input.note;
        }

        if (input.location !== undefined) {
          updatePayload.location = input.location;
        }

        if (teamId !== null && existingAttendance.teamId == null) {
          updatePayload.teamId = teamId;
        }

        const [updatedAttendance] = await db
          .update(attendanceTable)
          .set(updatePayload)
          .where(eq(attendanceTable.id, existingAttendance.id))
          .returning();

        if (updatedAttendance == null) {
          throw new ORPCError("INTERNAL_SERVER_ERROR", {
            message: "Punch in failed.",
          });
        }

        return updatedAttendance;
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
          isManualEntry: false,
        })
        .returning();

      if (attendance == null) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Punch in failed.",
        });
      }

      return MemberPunchInOutput.parse(attendance);
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

      const attendance = await db.query.attendanceTable.findFirst({
        where: and(
          eq(attendanceTable.organizationId, orgId),
          eq(attendanceTable.userId, user.id),
          eq(attendanceTable.date, now),
          eq(attendanceTable.isDeleted, false)
        ),
      });

      if (attendance == null || attendance.checkInTime == null) {
        throw new ORPCError("CONFLICT", {
          message: "You need to punch in before you can punch out.",
        });
      }

      if (attendance.checkOutTime != null) {
        throw new ORPCError("CONFLICT", {
          message: "You have already punched out today.",
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

      if (updatedAttendance == null) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Punch out failed.",
        });
      }

      return updatedAttendance;
    }),

  attendanceStatus: protectedProcedure
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
