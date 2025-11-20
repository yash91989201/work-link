import { ORPCError } from "@orpc/server";
import { attendanceTable, workBlockTable } from "@work-link/db/schema/index";
import { and, eq, isNull } from "drizzle-orm";
import { protectedProcedure } from "@/index";
import {
  EndBlockInput,
  EndBlockOutput,
  GetActiveBlockInput,
  GetActiveBlockOutput,
  ListBlocksInput,
  ListBlocksOutput,
  StartBlockInput,
  StartBlockOutput,
} from "@/lib/schemas/work-block";

export const workBlockRouter = {
  getActiveBlock: protectedProcedure
    .input(GetActiveBlockInput)
    .output(GetActiveBlockOutput)
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

      const activeBlock = await db.query.workBlockTable.findFirst({
        where: and(
          eq(workBlockTable.attendanceId, input.attendanceId),
          isNull(workBlockTable.endedAt)
        ),
      });

      return activeBlock ?? null;
    }),

  startBlock: protectedProcedure
    .input(StartBlockInput)
    .output(StartBlockOutput)
    .handler(async ({ input, context: { db, session } }) => {
      const user = session.user;
      const now = new Date();

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
          message: "Cannot start work block after punch out.",
        });
      }

      // Check for active work block
      const activeBlock = await db.query.workBlockTable.findFirst({
        where: and(
          eq(workBlockTable.attendanceId, input.attendanceId),
          isNull(workBlockTable.endedAt)
        ),
      });

      if (activeBlock) {
        throw new ORPCError("CONFLICT", {
          message: "A work block is already active for this attendance.",
        });
      }

      // Create new work block
      const [workBlock] = await db
        .insert(workBlockTable)
        .values({
          attendanceId: input.attendanceId,
          userId: user.id,
          startedAt: now,
          endedAt: null,
          durationMinutes: null,
          endReason: null,
        })
        .returning();

      if (!workBlock) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to create work block.",
        });
      }

      return workBlock;
    }),

  endBlock: protectedProcedure
    .input(EndBlockInput)
    .output(EndBlockOutput)
    .handler(async ({ input, context: { db, session } }) => {
      const user = session.user;
      const now = new Date();

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

      // Find active work block
      const activeBlock = await db.query.workBlockTable.findFirst({
        where: and(
          eq(workBlockTable.attendanceId, input.attendanceId),
          isNull(workBlockTable.endedAt)
        ),
      });

      if (!activeBlock) {
        throw new ORPCError("NOT_FOUND", {
          message: "No active work block found for this attendance.",
        });
      }

      // Calculate duration
      const durationMs = now.getTime() - activeBlock.startedAt.getTime();
      const durationMinutes = Math.floor(durationMs / 60_000);

      // Update work block
      const [updatedBlock] = await db
        .update(workBlockTable)
        .set({
          endedAt: now,
          durationMinutes,
          endReason: input.endReason,
        })
        .where(eq(workBlockTable.id, activeBlock.id))
        .returning();

      if (!updatedBlock) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to update work block.",
        });
      }

      return updatedBlock;
    }),

  listBlocks: protectedProcedure
    .input(ListBlocksInput)
    .output(ListBlocksOutput)
    .handler(async ({ input, context: { db, session } }) => {
      const user = session.user;

      const attendance = await db.query.attendanceTable.findFirst({
        where: and(
          eq(attendanceTable.id, input.attendanceId),
          eq(attendanceTable.userId, user.id),
          eq(attendanceTable.isDeleted, false)
        ),
      });

      if (!attendance) {
        return [];
      }

      const blocks = await db.query.workBlockTable.findMany({
        where: eq(workBlockTable.attendanceId, input.attendanceId),
        orderBy: (workBlockTable, { desc }) => [desc(workBlockTable.startedAt)],
      });

      return blocks;
    }),
};
