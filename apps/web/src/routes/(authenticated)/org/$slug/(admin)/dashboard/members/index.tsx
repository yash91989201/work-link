import { createFileRoute } from "@tanstack/react-router";
import { MembersDashboard } from "@/components/admin/members/members-dashboard";

export const Route = createFileRoute(
  "/(authenticated)/org/$slug/(admin)/dashboard/members/"
)({
  component: RouteComponent,
});

function RouteComponent() {
  return <MembersDashboard />;
}
