import { createFileRoute } from "@tanstack/react-router";
import { InvitationListTable } from "@/components/admin/invitation-list-table";
import { InviteMemberForm } from "@/components/admin/members/invite-member-form";

export const Route = createFileRoute(
  "/(authenticated)/org/$slug/(admin)/dashboard/members/"
)({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <InviteMemberForm />

      <InvitationListTable />
    </div>
  );
}
