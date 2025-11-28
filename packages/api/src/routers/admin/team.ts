import { ORPCError } from "@orpc/client";
import { team } from "@work-link/db/schema/index";
import { eq } from "drizzle-orm";
import { auth } from "@work-link/auth";
import { protectedProcedure } from "@/index";
import { ListTeamsInput, ListTeamsOutput, AddMemberInput, AddMemberOutput, RemoveMemberInput, RemoveMemberOutput } from "@/lib/schemas/team";


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
        with: {
          teamMembers: {
            with: {
              user: true,
            },
          },
        },
      });

      return { teams };
    }),

  addMember: protectedProcedure
    .input(AddMemberInput)
    .output(AddMemberOutput)
    .handler(async ({ input: { teamId, userIds }, context: { headers } }) => {
      try {
        let addedCount = 0;
        const errors: string[] = [];

        // Add members one by one
        for (const userId of userIds) {
          try {
            await auth.api.addMember({
              body: {
                userId,
                teamId,
                role: "member", // Default role
              },
              headers,
            });
            addedCount++;
          } catch (error) {
            errors.push(
              `Failed to add user ${userId}: ${error instanceof Error ? error.message : "Unknown error"}`
            );
          }
        }

        if (addedCount === 0) {
          throw new ORPCError("INTERNAL_SERVER_ERROR", {
            message: `Failed to add any members. Errors: ${errors.join(", ")}`,
          });
        }

        return {
          success: true,
          message:
            addedCount === userIds.length
              ? `Successfully added ${addedCount} member(s)`
              : `Added ${addedCount} of ${userIds.length} member(s). Some failed: ${errors.join(", ")}`,
          addedCount,
        };
      } catch (error) {
        if (error instanceof ORPCError) {
          throw error;
        }
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: error instanceof Error ? error.message : "Failed to add members to team",
        });
      }
    }),

  removeMember: protectedProcedure
    .input(RemoveMemberInput)
    .output(RemoveMemberOutput)
    .handler(async ({ input: { teamId, userIds }, context: { headers } }) => {
      try {
        let removedCount = 0;
        const errors: string[] = [];

        // Remove members one by one using Better Auth's API
        for (const userId of userIds) {
          try {
            await auth.api.removeTeamMember({
              body: {
                teamId,
                userId,
              },
              headers,
            });
            removedCount++;
          } catch (error) {
            errors.push(
              `Failed to remove user ${userId}: ${error instanceof Error ? error.message : "Unknown error"}`
            );
          }
        }

        if (removedCount === 0) {
          throw new ORPCError("INTERNAL_SERVER_ERROR", {
            message: `Failed to remove any members. Errors: ${errors.join(", ")}`,
          });
        }

        return {
          success: true,
          message:
            removedCount === userIds.length
              ? `Successfully removed ${removedCount} member(s)`
              : `Removed ${removedCount} of ${userIds.length} member(s). Some failed: ${errors.join(", ")}`,
          removedCount,
        };
      } catch (error) {
        if (error instanceof ORPCError) {
          throw error;
        }
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: error instanceof Error ? error.message : "Failed to remove members from team",
        });
      }
    }),
};
