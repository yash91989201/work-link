import { ORPCError } from "@orpc/client";
import { team } from "@work-link/db/schema/index";
import { eq } from "drizzle-orm";
import { protectedProcedure } from "@/index";
import { ListTeamsInput, ListTeamsOutput } from "@/lib/schemas/team";

export const adminTeamRouter = {
  listTeams: protectedProcedure
    .input(ListTeamsInput)
    .output(ListTeamsOutput)
    .handler(async ({ context: { db, session } }) => {
      const organizationId = session.session.activeOrganizationId;
      if (!organizationId)
        throw new ORPCError("BAD_REQUEST", {
          message: "No active organization",
        });

      const teams = await db.query.team.findMany({
        where: eq(team.organizationId, organizationId),
      });

      return { teams };
    }),
};
