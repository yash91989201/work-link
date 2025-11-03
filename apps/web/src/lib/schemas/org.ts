import z from "zod";
import { authClient } from "@/lib/auth-client";

export const CreateOrgFormSchema = z.object({
  name: z
    .string()
    .min(6, "Name must be at least 6 characters")
    .max(48, "Name must be at most 48 characters"),
  slug: z
    .string()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Only a-z, 0-9 and - are allowed.")
    .min(4, "Slug must be at least 4 characters")
    .max(40, "Slug must be at most 40 characters")
    .refine(
      async (slug) => {
        try {
          const { data, error } = await authClient.organization.checkSlug({
            slug,
          });
          return data?.status === true || !error;
        } catch {
          return false;
        }
      },
      {
        message: "This slug is already taken",
      }
    ),
  logo: z.url().optional(),
  formState: z.object({
    logo: z
      .file()
      .optional()
      .refine(
        (file) => !file || file.size < 5 * 1024 * 1024,
        "File size must be under 5MB"
      ),
    slugLocked: z.boolean().optional(),
  }),
});
