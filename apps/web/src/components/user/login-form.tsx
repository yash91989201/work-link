import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { type SubmitHandler, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { LogInFormSchema } from "@/lib/schemas/auth";
import type { LogInFormType } from "@/lib/types";

export function LogInForm() {
  const navigate = useNavigate();

  const { mutateAsync: login, isPending } = useMutation({
    mutationKey: ["login"],
    mutationFn: async (values: LogInFormType) => {
      return await authClient.signIn.email(values);
    },
  });

  const form = useForm<LogInFormType>({
    resolver: zodResolver(LogInFormSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit: SubmitHandler<LogInFormType> = async (values) => {
    try {
      const loginResult = await login(values);

      if (loginResult.error) {
        throw new Error(loginResult.error.message);
      }

      const { data: orgs, error: orgListError } =
        await authClient.organization.list();

      if (orgListError !== null) {
        throw new Error(orgListError.message);
      }

      const org = orgs[0];

      await authClient.organization.setActive({
        organizationId: org.id,
        organizationSlug: org.slug,
      });

      if (org) {
        navigate({
          to: "/org/$slug",
          params: {
            slug: org.slug,
          },
        });
        return;
      }

      navigate({
        to: "/org/new",
      });
    } catch (error) {
      form.setError("email", {
        message: error instanceof Error ? error.message : "Login failed",
      });
    }
  };

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Enter your email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter your password"
                  type="password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button disabled={isPending || form.formState.isSubmitting}>
          {isPending || form.formState.isSubmitting
            ? "Logging in..."
            : "Log In"}
        </Button>
      </form>
    </Form>
  );
}
