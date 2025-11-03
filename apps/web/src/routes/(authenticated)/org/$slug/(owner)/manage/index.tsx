import { createFileRoute } from "@tanstack/react-router";
import { InvitationManagement } from "@/components/owner/invitation-management";
import { MemberManagement } from "@/components/owner/member-management";
import { TeamManagement } from "@/components/owner/team-management";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute(
  "/(authenticated)/org/$slug/(owner)/manage/"
)({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="py-6">
      <div className="mx-auto">
        <div className="space-y-6">
          <div className="flex flex-col gap-4">
            <h1 className="font-bold text-3xl tracking-tight">
              Organization Management
            </h1>
            <p className="text-muted-foreground">
              Manage your organization, members, teams, and invitations
            </p>
          </div>

          <Tabs className="space-y-4" defaultValue="members">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="members">Members</TabsTrigger>
              <TabsTrigger value="teams">Teams</TabsTrigger>
              <TabsTrigger value="invitations">Invitations</TabsTrigger>
            </TabsList>

            <TabsContent className="space-y-4" value="members">
              <MemberManagement />
            </TabsContent>

            <TabsContent className="space-y-4" value="teams">
              <TeamManagement />
            </TabsContent>

            <TabsContent className="space-y-4" value="invitations">
              <InvitationManagement />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
