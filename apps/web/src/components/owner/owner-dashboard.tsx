import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InvitationManagement } from "./invitation-management";
import { MemberManagement } from "./member-management";
import { OrganizationOverview } from "./organization-overview";
import { TeamManagement } from "./team-management";

export const OwnerDashboard = () => (
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

      <OrganizationOverview />

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
);
