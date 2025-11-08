import { ORPCError } from "@orpc/client";
import { member, team } from "@work-link/db/schema/index";
import { count, eq } from "drizzle-orm";
import { protectedProcedure } from "@/index";

export const adminDashboardRouter = {
  getMemberCount: protectedProcedure.handler(
    async ({ context: { db, session } }) => {
      const organizationId = session.session.activeOrganizationId;
      if (!organizationId) {
        throw new ORPCError("UNAUTHORIZED", {
          message: "Unauthorized",
        });
      }

      const [memberRows] = await db
        .select({
          count: count(),
        })
        .from(member)
        .where(eq(member.organizationId, organizationId));

      return memberRows?.count ?? 0;
    }
  ),

  getTeamCount: protectedProcedure.handler(
    async ({ context: { db, session } }) => {
      const organizationId = session.session.activeOrganizationId;
      if (!organizationId) {
        throw new ORPCError("UNAUTHORIZED", {
          message: "Unauthorized",
        });
      }

      const [teamRows] = await db
        .select({
          count: count(),
        })
        .from(team)
        .where(eq(team.organizationId, organizationId));

      return teamRows?.count ?? 0;
    }
  ),
};
