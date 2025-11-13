import { createFileRoute } from "@tanstack/react-router";
import { InvitationListTable } from "@/components/admin/invitation-list-table";
import { InviteMemberForm } from "@/components/admin/members/invite-member-form";
import { MemberListTable } from "@/components/owner/member-list-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute(
  "/(authenticated)/org/$slug/(admin)/dashboard/members/"
)({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="py-4">
        <div>
          <h1 className="mt-2 font-bold text-2xl">Members</h1>
          <p className="text-muted-foreground">
            Manage organization members, invitations, and roles
          </p>
        </div>
      </div>

      <Tabs className="flex-1" defaultValue="members">
        <TabsList>
          <TabsTrigger value="members">Member List</TabsTrigger>
          <TabsTrigger value="invitations">Manage Invitations</TabsTrigger>
        </TabsList>

        <TabsContent className="mt-4" value="members">
          <MemberListTable />
        </TabsContent>

        <TabsContent className="mt-4" value="invitations">
          <div className="mb-4 flex justify-end">
            <InviteMemberForm />
          </div>
          <InvitationListTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
