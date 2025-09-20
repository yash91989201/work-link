import z from "zod";

export const CreateOrgFormSchema = z.object({
  name: z
    .string()
    .min(6, "Name must be at least 6 characters")
    .max(48, "Name must be at most 48 characters"),
  slug: z
    .string()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Only a-z, 0-9 and - are allowed."),
  logo: z.url().optional(),
  formState: z.object({
    logo: z
      .file()
      .optional()
      .refine(
        (file) => !file || file.size < 5 * 1024 * 1024,
        "File size must be under 5MB"
      ),
    // Track whether the slug is locked (auto-generated). Defaults to true in the form.
    slugLocked: z.boolean().optional(),
  }),
});
