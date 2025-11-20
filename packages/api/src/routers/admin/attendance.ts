import { ORPCError } from "@orpc/server";
import {
  attendanceTable,
  member,
  user,
  workBlockTable,
} from "@work-link/db/schema/index";
import { and, count, desc, eq, gte, ilike, lte, or } from "drizzle-orm";
import { protectedProcedure } from "@/index";
import {
  GetAttendanceDetailInput,
  GetAttendanceDetailOutput,
  GetAttendanceStatsInput,
  GetAttendanceStatsOutput,
  ListAttendanceRecordsInput,
  ListAttendanceRecordsOutput,
} from "@/lib/schemas/admin-attendance";

export const adminAttendanceRouter = {
  getAttendanceStats: protectedProcedure
    .input(GetAttendanceStatsInput)
    .output(GetAttendanceStatsOutput)
    .handler(async ({ context: { db, session } }) => {
      const organizationId = session.session.activeOrganizationId;
      if (!organizationId) {
        throw new ORPCError("UNAUTHORIZED", {
          message: "Unauthorized",
        });
      }

      // Get total members count
      const [totalMembersRow] = await db
        .select({
          count: count(),
        })
        .from(member)
        .where(eq(member.organizationId, organizationId));

      const totalMembers = totalMembersRow?.count ?? 0;

      // Get present today count (attendance records with checkInTime today and no checkOutTime or checkOutTime today)
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [presentTodayRow] = await db
        .select({
          count: count(),
        })
        .from(attendanceTable)
        .where(
          and(
            eq(attendanceTable.organizationId, organizationId),
            eq(attendanceTable.date, today),
            eq(attendanceTable.isDeleted, false)
          )
        );

      const presentToday = presentTodayRow?.count ?? 0;

      return {
        totalMembers,
        presentToday,
      };
    }),

  listAttendanceRecords: protectedProcedure
    .input(ListAttendanceRecordsInput)
    .output(ListAttendanceRecordsOutput)
    .handler(async ({ input, context: { db, session } }) => {
      const organizationId = session.session.activeOrganizationId;
      if (!organizationId) {
        throw new ORPCError("UNAUTHORIZED", {
          message: "Unauthorized",
        });
      }

      const { page, perPage, search, date, startDate, endDate, status } = input;
      const offset = (page - 1) * perPage;

      // Build where conditions
      const conditions = [
        eq(attendanceTable.organizationId, organizationId),
        eq(attendanceTable.isDeleted, false),
      ];

      // Handle date filtering (single date or date range)
      if (date) {
        const searchDate = new Date(date);
        searchDate.setHours(0, 0, 0, 0);
        conditions.push(eq(attendanceTable.date, searchDate));
      } else if (startDate && endDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        conditions.push(gte(attendanceTable.date, start));
        conditions.push(lte(attendanceTable.date, end));
      } else if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        conditions.push(gte(attendanceTable.date, start));
      } else if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        conditions.push(lte(attendanceTable.date, end));
      }

      if (status) {
        conditions.push(eq(attendanceTable.status, status));
      }

      // Add search condition for user name or email
      let searchCondition = undefined;
      if (search) {
        searchCondition = or(
          ilike(user.name, `%${search}%`),
          ilike(user.email, `%${search}%`)
        );
      }

      // Get total count
      const [totalRow] = await db
        .select({
          count: count(),
        })
        .from(attendanceTable)
        .innerJoin(user, eq(attendanceTable.userId, user.id))
        .where(
          searchCondition
            ? and(...conditions, searchCondition)
            : and(...conditions)
        );

      const total = totalRow?.count ?? 0;
      const totalPages = Math.ceil(total / perPage);

      // Get records with user data
      const records = await db
        .select({
          id: attendanceTable.id,
          userId: attendanceTable.userId,
          organizationId: attendanceTable.organizationId,
          teamId: attendanceTable.teamId,
          date: attendanceTable.date,
          status: attendanceTable.status,
          checkInTime: attendanceTable.checkInTime,
          checkOutTime: attendanceTable.checkOutTime,
          totalHours: attendanceTable.totalHours,
          breakDuration: attendanceTable.breakDuration,
          location: attendanceTable.location,
          coordinates: attendanceTable.coordinates,
          ipAddress: attendanceTable.ipAddress,
          deviceInfo: attendanceTable.deviceInfo,
          notes: attendanceTable.notes,
          adminNotes: attendanceTable.adminNotes,
          verifiedBy: attendanceTable.verifiedBy,
          isManualEntry: attendanceTable.isManualEntry,
          isApproved: attendanceTable.isApproved,
          approvedBy: attendanceTable.approvedBy,
          approvedAt: attendanceTable.approvedAt,
          clockInMethod: attendanceTable.clockInMethod,
          clockOutMethod: attendanceTable.clockOutMethod,
          shiftId: attendanceTable.shiftId,
          overtimeHours: attendanceTable.overtimeHours,
          isDeleted: attendanceTable.isDeleted,
          createdAt: attendanceTable.createdAt,
          updatedAt: attendanceTable.updatedAt,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
          },
        })
        .from(attendanceTable)
        .innerJoin(user, eq(attendanceTable.userId, user.id))
        .where(
          searchCondition
            ? and(...conditions, searchCondition)
            : and(...conditions)
        )
        .orderBy(desc(attendanceTable.date), desc(attendanceTable.checkInTime))
        .limit(perPage)
        .offset(offset);

      return {
        records,
        pagination: {
          page,
          perPage,
          total,
          totalPages,
        },
      };
    }),

  getAttendanceDetail: protectedProcedure
    .input(GetAttendanceDetailInput)
    .output(GetAttendanceDetailOutput)
    .handler(async ({ input, context: { db, session } }) => {
      const organizationId = session.session.activeOrganizationId;
      if (!organizationId) {
        throw new ORPCError("UNAUTHORIZED", {
          message: "Unauthorized",
        });
      }

      const { attendanceId } = input;

      // Get attendance record with user data
      const [record] = await db
        .select({
          id: attendanceTable.id,
          userId: attendanceTable.userId,
          organizationId: attendanceTable.organizationId,
          teamId: attendanceTable.teamId,
          date: attendanceTable.date,
          status: attendanceTable.status,
          checkInTime: attendanceTable.checkInTime,
          checkOutTime: attendanceTable.checkOutTime,
          totalHours: attendanceTable.totalHours,
          breakDuration: attendanceTable.breakDuration,
          location: attendanceTable.location,
          coordinates: attendanceTable.coordinates,
          ipAddress: attendanceTable.ipAddress,
          deviceInfo: attendanceTable.deviceInfo,
          notes: attendanceTable.notes,
          adminNotes: attendanceTable.adminNotes,
          verifiedBy: attendanceTable.verifiedBy,
          isManualEntry: attendanceTable.isManualEntry,
          isApproved: attendanceTable.isApproved,
          approvedBy: attendanceTable.approvedBy,
          approvedAt: attendanceTable.approvedAt,
          clockInMethod: attendanceTable.clockInMethod,
          clockOutMethod: attendanceTable.clockOutMethod,
          shiftId: attendanceTable.shiftId,
          overtimeHours: attendanceTable.overtimeHours,
          isDeleted: attendanceTable.isDeleted,
          createdAt: attendanceTable.createdAt,
          updatedAt: attendanceTable.updatedAt,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
          },
        })
        .from(attendanceTable)
        .innerJoin(user, eq(attendanceTable.userId, user.id))
        .where(
          and(
            eq(attendanceTable.id, attendanceId),
            eq(attendanceTable.organizationId, organizationId),
            eq(attendanceTable.isDeleted, false)
          )
        );

      if (!record) {
        throw new ORPCError("NOT_FOUND", {
          message: "Attendance record not found",
        });
      }

      // Get work blocks for this attendance
      const workBlocks = await db
        .select({
          id: workBlockTable.id,
          startedAt: workBlockTable.startedAt,
          endedAt: workBlockTable.endedAt,
          durationMinutes: workBlockTable.durationMinutes,
          endReason: workBlockTable.endReason,
        })
        .from(workBlockTable)
        .where(eq(workBlockTable.attendanceId, attendanceId))
        .orderBy(workBlockTable.startedAt);

      return {
        ...record,
        workBlocks,
      };
    }),
};
