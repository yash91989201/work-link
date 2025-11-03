import { createFileRoute } from "@tanstack/react-router";
import { AdminDashboard } from "@/components/admin/dashboard/admin-dashboard";

export const Route = createFileRoute(
  "/(authenticated)/org/$slug/(admin)/dashboard/"
)({
  component: RouteComponent,
});

function RouteComponent() {
  return <AdminDashboard />;
}
