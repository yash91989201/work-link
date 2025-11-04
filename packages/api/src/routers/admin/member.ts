import { ORPCError } from "@orpc/client";
import { member } from "@work-link/db/schema/index";
import { eq } from "drizzle-orm";
import { protectedProcedure } from "@/index";

export const adminMemberRouter = {
  listMembers: protectedProcedure.handler(
    async ({ context: { db, session } }) => {
      const organizationId = session.session.activeOrganizationId;
      if (!organizationId) {
        throw new ORPCError("BAD_REQUEST", {
          message: "No active organization",
        });
      }

      const members = await db.query.member.findMany({
        where: eq(member.organizationId, organizationId),
        with: {
          user: true,
        },
      });

      return { members };
    }
  ),
};
