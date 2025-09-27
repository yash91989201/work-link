import { createFileRoute } from "@tanstack/react-router";
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
    </div>
  );
}
