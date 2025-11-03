import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, useParams, useSearch } from "@tanstack/react-router";
import { Loader } from "lucide-react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
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
import { acceptInvitationAndActivate } from "@/lib/auth/invitation";
import { deriveNameFromEmail } from "@/lib/auth/utils";
import { authClient } from "@/lib/auth-client";
import { AcceptInvitationFormSchema } from "@/lib/schemas/auth";
import type { AcceptInvitationFormType } from "@/lib/types";

export const getUserOrgLink = (role: string) => {
  if (role === "admin") {
    return "/org/$slug/dashboard";
  }

  return "/org/$slug/attendance";
};

export function AcceptInvitationForm() {
  const { id: invitationId } = useParams({
    from: "/(auth)/accept-invitation/$id",
  });

  const { email } = useSearch({
    from: "/(auth)/accept-invitation/$id",
  });
  const navigate = useNavigate();

  const form = useForm<AcceptInvitationFormType>({
    resolver: standardSchemaResolver(AcceptInvitationFormSchema),
    defaultValues: {
      email,
      name: deriveNameFromEmail(email),
      password: "",
      invitationId,
    },
  });

  const { mutateAsync: acceptInvitation, isPending } = useMutation({
    mutationKey: ["acceptInvitation", invitationId],
    mutationFn: (formValues: AcceptInvitationFormType) =>
      acceptInvitationAndActivate({ ...formValues, invitationId }),
    onSuccess: async (slug) => {
      toast.success("Invitation accepted successfully!");

      const { data, error } =
        await authClient.organization.getActiveMemberRole();

      if (error !== null) {
        throw new Error(error.message);
      }

      const orgLink = getUserOrgLink(data.role);

      if (slug) {
        navigate({
          to: orgLink,
          params: { slug },
        });
        return;
      }

      navigate({
        to: "/org/new",
      });
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : "Failed to accept invitation";

      form.setError("password", { message });
      toast.error(message);
    },
  });

  const onSubmit: SubmitHandler<AcceptInvitationFormType> = async (values) => {
    form.clearErrors();
    await acceptInvitation({ ...values, invitationId });
  };

  const formDisabled = isPending || form.formState.isSubmitting;

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
                <Input disabled readOnly {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  autoComplete="name"
                  disabled={formDisabled}
                  placeholder="Your full name"
                  {...field}
                />
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
                  autoComplete="new-password"
                  disabled={formDisabled}
                  placeholder="Create a password"
                  type="password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <input hidden type="hidden" {...form.register("invitationId")} />

        <Button className="w-full" disabled={formDisabled}>
          {form.formState.isSubmitting ? (
            <>
              <Loader className="h-4 w-4 animate-spin" />
              <span>Accepting...</span>
            </>
          ) : (
            <span>Accept Invite</span>
          )}
        </Button>
      </form>
    </Form>
  );
}
