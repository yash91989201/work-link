import { z } from "zod";

export const JoinChannelRequestFormSchema = z.object({
  channelId: z.string(),
  note: z
    .string()
    .min(1, "Please provide a reason for joining")
    .max(500, "Note must be less than 500 characters")
    .optional(),
});