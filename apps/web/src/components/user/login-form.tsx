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
      await login(values);

      const { data: org, error } =
        await authClient.organization.getFullOrganization();

      if (error !== null) {
        throw new Error(error.message);
      }

      if (org === null) {
        navigate({
          to: "/org/new",
        });
        return;
      }

      navigate({
        to: "/org/$slug",
        params: {
          slug: org.slug,
        },
      });
    } catch (error) {
      console.log(error);
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
