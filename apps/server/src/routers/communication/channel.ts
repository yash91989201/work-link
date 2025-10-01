import { ORPCError } from "@orpc/server";
import type { SQL } from "drizzle-orm";
import { and, eq } from "drizzle-orm";
import { member, user as userTable } from "@/db/schema/auth";
import { channelMemberTable, channelTable } from "@/db/schema/communication";
import { protectedProcedure } from "@/lib/orpc";
import {
  ChannelWithCreatorOutput,
  CreateChannelInput,
  CreateChannelOutput,
  GetChannelInput,
  GetChannelMembersInput,
  GetChannelMembersOutput,
  ListChannelsInput,
  ListChannelsOutput,
  UpdateChannelInput,
} from "@/lib/schemas/channel";
import { ChannelSchema } from "@/lib/schemas/db-tables";

const toMetadata = (value: unknown) => {
  if (value == null || typeof value !== "object") {
    return null;
  }
  return value as Record<string, unknown>;
};

export const channelRouter = {
  // Create a new channel
  create: protectedProcedure
    .input(CreateChannelInput)
    .output(CreateChannelOutput)
    .handler(async ({ input, context }) => {
      const { db, session } = context;
      const user = session.user;
      const orgId = session.session.activeOrganizationId;

      if (!orgId) {
        throw new ORPCError("NOT_FOUND", {
          message: "Organization not found.",
        });
      }

      // Verify user is a member of the organization
      const membership = await db.query.member.findFirst({
        where: and(
          eq(member.organizationId, orgId),
          eq(member.userId, user.id)
        ),
      });

      if (!membership) {
        throw new ORPCError("FORBIDDEN", {
          message: "You are not a member of this organization.",
        });
      }

      const [newChannel] = await db
        .insert(channelTable)
        .values(input)
        .returning();

      const channelMembers = input.memberIds.map((memberId) => ({
        channelId: newChannel.id,
        userId: memberId,
        role: memberId === user.id ? "admin" : "member",
      }));

      await db.insert(channelMemberTable).values(channelMembers).returning();

      return newChannel;
    }),

  // Update a channel
  update: protectedProcedure
    .input(UpdateChannelInput)
    .output(ChannelSchema)
    .handler(async ({ input, context }) => {
      const [updatedChannel] = await context.db
        .update(channelTable)
        .set(input)
        .where(eq(channelTable.id, input.channelId))
        .returning();

      return updatedChannel;
    }),

  // Get a single channel
  get: protectedProcedure
    .input(GetChannelInput)
    .output(ChannelWithCreatorOutput.nullable())
    .handler(async ({ context, input }) => {
      const [channel] = await context.db
        .select({
          id: channelTable.id,
          name: channelTable.name,
          description: channelTable.description,
          type: channelTable.type,
          organizationId: channelTable.organizationId,
          teamId: channelTable.teamId,
          createdBy: channelTable.createdBy,
          isPrivate: channelTable.isPrivate,
          isArchived: channelTable.isArchived,
          lastMessageAt: channelTable.lastMessageAt,
          messageCount: channelTable.messageCount,
          metadata: channelTable.metadata,
          createdAt: channelTable.createdAt,
          updatedAt: channelTable.updatedAt,
          creatorName: userTable.name,
          creatorImage: userTable.image,
        })
        .from(channelTable)
        .leftJoin(userTable, eq(userTable.id, channelTable.createdBy))
        .where(eq(channelTable.id, input.channelId))
        .limit(1);

      if (!channel) {
        return null;
      }

      return {
        ...channel,
        metadata: toMetadata(channel.metadata),
      };
    }),

  list: protectedProcedure
    .input(ListChannelsInput)
    .output(ListChannelsOutput)
    .handler(async ({ context, input }) => {
      const orgId = context.session.session.activeOrganizationId ?? "";
      const teamId = input.teamId ?? context.session.session.activeTeamId ?? "";

      const filters: SQL[] = [eq(channelTable.organizationId, orgId)];

      if (input?.type) {
        filters.push(eq(channelTable.type, input.type));
      }

      if (input?.teamId) {
        filters.push(eq(channelTable.teamId, teamId));
      }

      if (!input?.includeArchived) {
        filters.push(eq(channelTable.isArchived, false));
      }

      const baseConditions = and(...filters);

      const channels = await context.db
        .select()
        .from(channelTable)
        .where(baseConditions);

      return {
        channels,
      };
    }),

  getMembers: protectedProcedure
    .input(GetChannelMembersInput)
    .output(GetChannelMembersOutput)
    .handler(async ({ input, context }) => {
      const members = await context.db
        .select({
          id: userTable.id,
          name: userTable.name,
          email: userTable.email,
          image: userTable.image,
          role: channelMemberTable.role,
          joinedAt: channelMemberTable.joinedAt,
        })
        .from(channelMemberTable)
        .innerJoin(userTable, eq(channelMemberTable.userId, userTable.id))
        .where(eq(channelMemberTable.channelId, input.channelId));

      return { members };
    }),
};
