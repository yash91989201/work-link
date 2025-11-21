import { ORPCError } from "@orpc/server";
import { member } from "@work-link/db/schema/index";
import { eq } from "drizzle-orm";
import { protectedProcedure } from "@/index";
import {
  getPresenceForUsers,
  setManualStatus,
  updatePresence,
} from "@/lib/presence";
import {
  GetOrgPresenceInput,
  GetOrgPresenceOutput,
  HeartbeatInput,
  HeartbeatOutput,
  SetManualStatusInput,
  SetManualStatusOutput,
} from "@/lib/schemas/presence";

export const presenceRouter = {
  heartbeat: protectedProcedure
    .input(HeartbeatInput)
    .output(HeartbeatOutput)
    .handler(async ({ input, context: { session, redis } }) => {
      const user = session.user;

      if (!redis) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Presence service is not available.",
        });
      }

      const status = await updatePresence(redis, user.id, input.orgId, {
        punchedIn: input.punchedIn,
        onBreak: input.onBreak,
        inCall: input.inCall,
        inMeeting: input.inMeeting,
        isTabFocused: input.isTabFocused,
        isIdle: input.isIdle,
        manualStatus: input.manualStatus ?? null,
      });

      return { status };
    }),

  setManualStatus: protectedProcedure
    .input(SetManualStatusInput)
    .output(SetManualStatusOutput)
    .handler(async ({ input, context: { session, redis } }) => {
      const user = session.user;

      if (!redis) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Presence service is not available.",
        });
      }

      await setManualStatus(redis, user.id, input.orgId, input.status);

      return { ok: true };
    }),

  getOrgPresence: protectedProcedure
    .input(GetOrgPresenceInput)
    .output(GetOrgPresenceOutput)
    .handler(async ({ input, context: { db, redis } }) => {
      if (!redis) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Presence service is not available.",
        });
      }

      // Fetch all members in the organization
      const members = await db.query.member.findMany({
        where: eq(member.organizationId, input.orgId),
        columns: {
          userId: true,
        },
      });

      const userIds = members.map((m) => m.userId);

      if (userIds.length === 0) {
        return { presence: {} };
      }

      // Fetch presence for all users
      const presence = await getPresenceForUsers(redis, userIds);

      return { presence };
    }),
};
