import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { Loader2 } from "lucide-react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuthedSession } from "@/hooks/use-authed-session";
import { getAuthQueryKey } from "@/lib/auth/query-keys";
import { authClient } from "@/lib/auth-client";
import { InviteMemberFormSchema } from "@/lib/schemas/admin/member";
import type { InviteMemberFormType } from "@/lib/types";
import { queryClient } from "@/utils/orpc";
import { TeamsDropdown } from "./teams-dropdown";

export const InviteMemberForm = () => {
  const { session } = useAuthedSession();
  const orgId = session.activeOrganizationId ?? "";

  const form = useForm({
    resolver: standardSchemaResolver(InviteMemberFormSchema),
    defaultValues: {
      email: "",
      teamId: "",
    },
  });

  const onSubmit: SubmitHandler<InviteMemberFormType> = async (formData) => {
    try {
      const { data: _, error } = await authClient.organization.inviteMember({
        email: formData.email,
        role: "member",
        teamId: formData.teamId,
      });

      if (error != null) {
        throw new Error(error.message);
      }

      queryClient.invalidateQueries({
        queryKey: getAuthQueryKey.organization.invitations(orgId),
      });

      toast.success("Member invitation sent successfully");
      form.reset();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong"
      );
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="font-bold text-2xl">Invite Team Member</CardTitle>
        <CardDescription className="text-muted-foreground">
          Send an invitation email to add a new member to your organization
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium text-sm">
                    Email Address
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="h-11"
                      placeholder="Enter member's email address"
                      type="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <TeamsDropdown />
            <Button
              className="h-11 w-full font-medium"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Sending Invitation...</span>
                </>
              ) : (
                <span>Send Invitation</span>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
