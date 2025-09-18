import z from "zod";

export const CreateOrganizationFormSchema = z.object({
  name: z
    .string()
    .min(6, "Name must be at least 6 characters")
    .max(48, "Name must be at most 48 characters"),
  slug: z
    .string()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Only a-z, 0-9 and - are allowed."),
  description: z
    .string()
    .max(240, "Description must be at most 240 characters")
    .optional(),
});
