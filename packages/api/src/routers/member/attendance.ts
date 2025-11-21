import { ORPCError } from "@orpc/server";
import type { AttendanceUpdateType } from "@work-link/db/lib/types";
import {
  attendanceTable,
  member,
  workBlockTable,
} from "@work-link/db/schema/index";
import { and, eq, isNull } from "drizzle-orm";
import { protectedProcedure } from "@/index";
import {
  AddBreakDurationInput,
  AddBreakDurationOutput,
  GetTodayInput,
  GetTodayOutput,
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
          breakDuration: 0,
        })
        .returning();

      if (!attendance) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to create attendance record.",
        });
      }

      // Create initial work block
      await db.insert(workBlockTable).values({
        attendanceId: attendance.id,
        userId: user.id,
        startedAt: now,
        endedAt: null,
        durationMinutes: null,
        endReason: null,
      });

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

      // End active work block if exists
      const activeBlock = await db.query.workBlockTable.findFirst({
        where: and(
          eq(workBlockTable.attendanceId, attendance.id),
          isNull(workBlockTable.endedAt)
        ),
      });

      if (activeBlock) {
        const durationMs = now.getTime() - activeBlock.startedAt.getTime();
        const durationMinutes = Math.floor(durationMs / 60_000);

        await db
          .update(workBlockTable)
          .set({
            endedAt: now,
            durationMinutes,
            endReason: "punch_out",
          })
          .where(eq(workBlockTable.id, activeBlock.id));
      }

      // Calculate total hours
      const totalMinutes =
        (now.getTime() - attendance.checkInTime!.getTime()) / 60_000 -
        (attendance.breakDuration ?? 0);
      const totalHours = (totalMinutes / 60).toFixed(2);

      const updatePayload: Partial<AttendanceUpdateType> = {
        checkOutTime: now,
        clockOutMethod: "manual",
        totalHours,
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

  addBreakDuration: protectedProcedure
    .input(AddBreakDurationInput)
    .output(AddBreakDurationOutput)
    .handler(async ({ input, context: { db, session } }) => {
      const user = session.user;

      // Validate attendance exists and belongs to user
      const attendance = await db.query.attendanceTable.findFirst({
        where: and(
          eq(attendanceTable.id, input.attendanceId),
          eq(attendanceTable.userId, user.id),
          eq(attendanceTable.isDeleted, false)
        ),
      });

      if (!attendance) {
        throw new ORPCError("NOT_FOUND", {
          message: "Attendance record not found.",
        });
      }

      if (attendance.checkOutTime) {
        throw new ORPCError("CONFLICT", {
          message: "Cannot add break duration after punch out.",
        });
      }

      // Update break duration
      const newBreakDuration = (attendance.breakDuration ?? 0) + input.minutes;

      await db
        .update(attendanceTable)
        .set({
          breakDuration: newBreakDuration,
        })
        .where(eq(attendanceTable.id, attendance.id));

      return {
        breakDuration: newBreakDuration,
      };
    }),

  getToday: protectedProcedure
    .input(GetTodayInput)
    .output(GetTodayOutput)
    .handler(async ({ input, context: { db, session } }) => {
      const user = session.user;
      const today = new Date();

      const attendance = await db.query.attendanceTable.findFirst({
        where: and(
          eq(attendanceTable.organizationId, input.orgId),
          eq(attendanceTable.userId, user.id),
          eq(attendanceTable.date, today),
          eq(attendanceTable.isDeleted, false)
        ),
      });

      return attendance ?? null;
    }),
};
