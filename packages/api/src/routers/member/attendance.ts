import { ORPCError } from "@orpc/server";
import type { AttendanceUpdateType } from "@work-link/db/lib/types";
import {
  attendanceTable,
  member,
  workBlockTable,
} from "@work-link/db/schema/index";
import { and, asc, eq, gte, isNull, lte } from "drizzle-orm";
import { protectedProcedure } from "@/index";
import {
  AddBreakDurationInput,
  AddBreakDurationOutput,
  AttendanceAnalyticsInput,
  AttendanceAnalyticsOutput,
  attendanceStatuses,
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

  getAnalytics: protectedProcedure
    .input(AttendanceAnalyticsInput.optional())
    .output(AttendanceAnalyticsOutput)
    .handler(async ({ input, context: { db, session } }) => {
      const user = session.user;
      const organizationId = session.session.activeOrganizationId;

      if (!organizationId) {
        throw new ORPCError("UNAUTHORIZED", {
          message: "Organization not found.",
        });
      }

      const today = new Date();
      const startDate = input?.startDate
        ? new Date(input.startDate)
        : new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000);
      const endDate = input?.endDate ? new Date(input.endDate) : today;

      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);

      const [rangeStart, rangeEnd] =
        startDate > endDate ? [endDate, startDate] : [startDate, endDate];

      const records = await db
        .select()
        .from(attendanceTable)
        .where(
          and(
            eq(attendanceTable.organizationId, organizationId),
            eq(attendanceTable.userId, user.id),
            eq(attendanceTable.isDeleted, false),
            gte(attendanceTable.date, rangeStart),
            lte(attendanceTable.date, rangeEnd)
          )
        )
        .orderBy(asc(attendanceTable.date));

      const presentStatuses = new Set([
        "present",
        "late",
        "partial",
        "work_from_home",
      ]);
      const excusedStatuses = new Set(["excused", "holiday", "sick_leave"]);

      const totalDays = records.length;
      const presentDays = records.filter((r) =>
        presentStatuses.has(r.status)
      ).length;
      const absentDays = records.filter((r) => r.status === "absent").length;
      const lateDays = records.filter((r) => r.status === "late").length;
      const remoteDays = records.filter(
        (r) => r.status === "work_from_home"
      ).length;
      const excusedDays = records.filter((r) =>
        excusedStatuses.has(r.status)
      ).length;

      const toNumber = (value: unknown) => {
        if (value === null || value === undefined) return 0;
        const num = Number(value);
        return Number.isFinite(num) ? num : 0;
      };

      const totalHours = records.reduce(
        (sum, record) => sum + toNumber(record.totalHours),
        0
      );
      const overtimeHours = records.reduce(
        (sum, record) => sum + toNumber(record.overtimeHours),
        0
      );
      const totalBreakMinutes = records.reduce(
        (sum, record) => sum + (record.breakDuration ?? 0),
        0
      );

      const averageDailyHours = presentDays > 0 ? totalHours / presentDays : 0;
      const averageBreakMinutes =
        totalDays > 0 ? totalBreakMinutes / totalDays : 0;
      const attendanceRate =
        totalDays > 0 ? ((presentDays + excusedDays) / totalDays) * 100 : 0;

      const statusBreakdown = attendanceStatuses.map((status) => ({
        status,
        count: records.filter((record) => record.status === status).length,
      }));

      const dailyTrends = records.map((record) => ({
        date: record.date.toISOString(),
        status: record.status,
        totalHours: record.totalHours ? toNumber(record.totalHours) : null,
        breakMinutes: record.breakDuration ?? null,
        checkInTime: record.checkInTime?.toISOString() ?? null,
        checkOutTime: record.checkOutTime?.toISOString() ?? null,
      }));

      const calculateAverageTime = (dates: Date[]) => {
        if (dates.length === 0) return null;
        const totalMinutes = dates.reduce((sum, date) => {
          return sum + date.getHours() * 60 + date.getMinutes();
        }, 0);
        const avgMinutes = totalMinutes / dates.length;
        const hours = Math.floor(avgMinutes / 60)
          .toString()
          .padStart(2, "0");
        const minutes = Math.round(avgMinutes % 60)
          .toString()
          .padStart(2, "0");
        return `${hours}:${minutes}`;
      };

      const checkIns = records
        .map((record) => record.checkInTime)
        .filter((date): date is Date => date instanceof Date);
      const checkOuts = records
        .map((record) => record.checkOutTime)
        .filter((date): date is Date => date instanceof Date);

      const punctuality = {
        averageCheckInTime: calculateAverageTime(checkIns),
        averageCheckOutTime: calculateAverageTime(checkOuts),
        earliestCheckIn:
          checkIns.length > 0
            ? new Date(
                Math.min(...checkIns.map((date) => date.getTime()))
              ).toISOString()
            : null,
        latestCheckOut:
          checkOuts.length > 0
            ? new Date(
                Math.max(...checkOuts.map((date) => date.getTime()))
              ).toISOString()
            : null,
      };

      const streakableStatuses = new Set([
        "present",
        "late",
        "partial",
        "work_from_home",
        "excused",
        "holiday",
        "sick_leave",
      ]);

      let currentStreak = 0;
      let longestStreak = 0;

      for (const record of records) {
        if (streakableStatuses.has(record.status)) {
          currentStreak += 1;
          if (currentStreak > longestStreak) {
            longestStreak = currentStreak;
          }
        } else {
          currentStreak = 0;
        }
      }

      return {
        range: {
          startDate: rangeStart.toISOString(),
          endDate: rangeEnd.toISOString(),
        },
        summary: {
          totalDays,
          presentDays,
          absentDays,
          lateDays,
          remoteDays,
          excusedDays,
          attendanceRate,
          averageDailyHours,
          averageBreakMinutes,
          totalHours,
          overtimeHours,
        },
        statusBreakdown,
        dailyTrends,
        punctuality,
        streaks: {
          currentStreak,
          longestStreak,
        },
      };
    }),
};
