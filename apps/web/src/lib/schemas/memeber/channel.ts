import { z } from "zod";

export const CreateChannelFormSchema = z
  .object({
    name: z.string().min(4).max(64),
    description: z.string().min(4).max(128).optional(),
    type: z.enum(["team", "group", "direct"]),
    isPublic: z.boolean().default(true),
    memberIds: z.array(z.string()),
    createdBy: z.string(),
    organizationId: z.string(),
  })
  .refine(
    (data) => {
      if (data.type === "team" || data.type === "group") {
        return data.memberIds.length >= 1;
      }
      return true;
    },
    {
      message: "Team and group channels must have at least one member",
      path: ["members"],
    }
  )
  .refine(
    (data) => {
      if (data.type === "direct") {
        return data.memberIds.length === 1;
      }
      return true;
    },
    {
      message: "Direct channels can only have one member",
      path: ["members"],
    }
  );
