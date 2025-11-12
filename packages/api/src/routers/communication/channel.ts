import { ORPCError } from "@orpc/server";
import { ChannelSchema } from "@work-link/db/lib/schemas/db-tables";
import {
  channelJoinRequestTable,
  channelMemberTable,
  channelTable,
  user as userTable,
} from "@work-link/db/schema/index";
import type { SQL } from "drizzle-orm";
import { and, eq, getTableColumns } from "drizzle-orm";
import { protectedProcedure } from "@/index";
import { generateTxId } from "@/lib/electric-proxy";
import {
  AddChannelMembersInput,
  ChannelJoinRequestInput,
  ChannelJoinRequestOutput,
  CreateChannelInput,
  CreateChannelOutput,
  GetChannelInput,
  GetChannelOutput,
  IsChannelMemberInput,
  IsChannelMemberOutput,
  ListChannelMembersInput,
  ListChannelMembersOutput,
  ListChannelsInput,
  ListChannelsOutput,
  ListJoinRequestInput,
  ListJoinRequestOutput,
  SuccessOutput,
  UpdateChannelInput,
} from "@/lib/schemas/channel";

export const channelRouter = {
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

      const { txid, channel } = await db.transaction(async (tx) => {
        const txid = await generateTxId(tx);

        const [channel] = await tx
          .insert(channelTable)
          .values(input)
          .returning();

        if (!channel) {
          throw new ORPCError("INTERNAL_SERVER_ERROR", {
            message: "Failed to create channel.",
          });
        }

        const channelMembers = input.memberIds.map((memberId) => ({
          channelId: channel.id,
          userId: memberId,
          role: memberId === user.id ? "admin" : "member",
        }));

        await tx.insert(channelMemberTable).values(channelMembers).returning();

        return { txid, channel };
      });

      return {
        txid,
        channel,
      };
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

      if (!updatedChannel) {
        throw new ORPCError("NOT_FOUND", {
          message: "Channel not found or could not be updated.",
        });
      }

      return updatedChannel;
    }),

  get: protectedProcedure
    .input(GetChannelInput)
    .output(GetChannelOutput)
    .handler(async ({ context, input }) => {
      const channel = await context.db.query.channelTable.findFirst({
        where: eq(channelTable.id, input.channelId),
        with: {
          creator: true,
        },
      });

      if (!channel) {
        throw new Error(
          "This channel does not exist or you do not have access to it."
        );
      }

      return channel;
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
        .select({
          ...getTableColumns(channelTable),
          creator: getTableColumns(userTable),
        })
        .from(channelTable)
        .innerJoin(userTable, eq(channelTable.createdBy, userTable.id))
        .where(baseConditions);

      return {
        channels,
      };
    }),

  listMembers: protectedProcedure
    .input(ListChannelMembersInput)
    .output(ListChannelMembersOutput)
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

      return members;
    }),
  isMember: protectedProcedure
    .input(IsChannelMemberInput)
    .output(IsChannelMemberOutput)
    .handler(async ({ input, context }) => {
      const isMember = await context.db.query.channelMemberTable.findFirst({
        where: and(
          eq(channelMemberTable.channelId, input.channelId),
          eq(channelMemberTable.userId, context.session.user.id)
        ),
      });

      return typeof isMember !== "undefined";
    }),

  addMembers: protectedProcedure
    .input(AddChannelMembersInput)
    .output(SuccessOutput)
    .handler(async ({ context, input }) => {
      const channelMembers = input.memberIds.map((memberId) => ({
        channelId: input.channelId,
        userId: memberId,
      }));

      await context.db.insert(channelMemberTable).values(channelMembers);

      return {
        success: true,
        message: "Members added to channel",
      };
    }),

  joinRequest: protectedProcedure
    .input(ChannelJoinRequestInput)
    .output(ChannelJoinRequestOutput)
    .handler(async ({ input, context }) => {
      const [newRequest] = await context.db
        .insert(channelJoinRequestTable)
        .values({
          channelId: input.channelId,
          userId: context.session.user.id,
          note: input.note,
        })
        .returning();

      if (!newRequest) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to create join request.",
        });
      }

      return newRequest;
    }),
  listJoinRequests: protectedProcedure
    .input(ListJoinRequestInput)
    .output(ListJoinRequestOutput)
    .handler(async ({ context: { db }, input }) => {
      const joinRequests = await db.query.channelJoinRequestTable.findMany({
        where: eq(channelJoinRequestTable.channelId, input.channelId),
        with: {
          user: true,
        },
      });

      return joinRequests;
    }),
};
