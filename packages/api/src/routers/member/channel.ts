import { ORPCError } from "@orpc/client";
import { channelMemberTable, channelTable } from "@work-link/db/schema/index";
import { and, eq, getTableColumns } from "drizzle-orm";
import { protectedProcedure } from "@/index";

export const memberChannelRouter = {
  listChannels: protectedProcedure.handler(
    async ({ context: { db, session } }) => {
      const organizationId = session.session.activeOrganizationId;

      if (!organizationId) {
        throw new ORPCError("BAD_REQUEST", {
          message: "No active organization",
        });
      }

      const userId = session.user.id;

      const channels = await db
        .select({ ...getTableColumns(channelTable) })
        .from(channelTable)
        .innerJoin(
          channelMemberTable,
          eq(channelMemberTable.channelId, channelTable.id)
        )
        .where(
          and(
            eq(channelMemberTable.userId, userId),
            eq(channelTable.organizationId, organizationId)
          )
        );

      return { channels };
    }
  ),
};
