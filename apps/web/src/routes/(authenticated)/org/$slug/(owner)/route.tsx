import { createFileRoute, Outlet } from "@tanstack/react-router";
import { OwnerRootLayout } from "@/components/owner/layout";

export const Route = createFileRoute("/(authenticated)/org/$slug/(owner)")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <OwnerRootLayout>
      <Outlet />
    </OwnerRootLayout>
  );
}
