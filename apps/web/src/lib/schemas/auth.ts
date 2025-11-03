import { z } from "zod";

export const LogInFormSchema = z.object({
  email: z.email("Invalid email address").nonempty("Email is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .nonempty("Password is required"),
});

export const SignUpFormSchema = z
  .object({
    name: z.string().min(6, "Enter your full name."),
    email: z.email("Invalid email address").nonempty("Email is required"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .nonempty("Password is required"),
    confirmPassword: z.string().nonempty("Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const AcceptInvitationFormSchema = z.object({
  email: z.email("Invalid email address").nonempty("Email is required"),
  name: z.string().min(1, "Name is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .nonempty("Password is required"),
  invitationId: z.string().min(1, "Invitation ID is required"),
});
