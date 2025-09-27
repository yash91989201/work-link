import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle, Mail, Users } from "lucide-react";
import { z } from "zod";
import { AcceptInvitationForm } from "@/components/shared/accept-invitation-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const RouteSearchSchema = z.object({
  email: z.email(),
});

export const Route = createFileRoute("/(auth)/accept-invitation/$id")({
  validateSearch: RouteSearchSchema,
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <h1 className="mb-2 font-bold text-3xl text-foreground">
            Join Organization
          </h1>
          <p className="text-muted-foreground">
            You've been invited to join an organization on Work Link
          </p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Mail className="h-5 w-5" />
              Invitation Pending
            </CardTitle>
            <CardDescription>
              Accept the invitation below to join the organization and start
              collaborating with your team.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg bg-muted/50 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Invitation ID:</span>
                <span className="rounded bg-background px-2 py-1 font-mono text-xs">
                  {id}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-muted-foreground text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Get access to organization resources</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Collaborate with team members</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Manage projects and tasks</span>
              </div>
            </div>

            <AcceptInvitationForm />
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-muted-foreground text-sm">
          <p>
            Having trouble? Contact the person who sent you this invitation.
          </p>
        </div>
      </div>
    </div>
  );
}
