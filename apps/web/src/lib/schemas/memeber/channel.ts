import { z } from "zod";

export const CreateChannelFormSchema = z
  .object({
    name: z.string().min(4).max(64),
    description: z.string().min(4).max(128).optional(),
    type: z.enum(["team", "group", "direct"]),
    isPublic: z.boolean().default(true),
    memberIds: z.array(z.string()),
    createdBy: z.string(),
    teamId: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.type === "team") {
        return typeof data.teamId === "string" && data.teamId.trim().length > 0;
      }

      return true;
    },
    {
      message: "Team channels must include a teamId",
      path: ["teamId"],
    }
  )
  .refine(
    (data) => {
      if (data.type === "group") {
        return data.memberIds.length >= 2;
      }

      return true;
    },
    {
      message: "Group channels must include at least two members",
      path: ["memberIds"],
    }
  )
  .refine(
    (data) => {
      if (data.type === "direct") {
        return data.memberIds.length === 2;
      }

      return true;
    },
    {
      message: "Direct channels must include exactly two members",
      path: ["memberIds"],
    }
  );

export const ModifyChannelMembersSchema = z.object({
  channelId: z.string(),
  memberIds: z.array(z.string()).min(1),
});
