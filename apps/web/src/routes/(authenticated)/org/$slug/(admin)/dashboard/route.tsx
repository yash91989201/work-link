import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AdminRootLayout } from "@/components/admin/layout";

export const Route = createFileRoute(
  "/(authenticated)/org/$slug/(admin)/dashboard"
)({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <AdminRootLayout>
      <Outlet />
    </AdminRootLayout>
  );
}
