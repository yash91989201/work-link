import { createFileRoute, Outlet } from "@tanstack/react-router";
import { OwnerHeader } from "@/components/owner";

export const Route = createFileRoute("/(authenticated)/org/$slug/(owner)")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="min-h-screen bg-background">
      <OwnerHeader organizationName="Acme Corp" organizationSlug="acme-corp" />
      <main className="container mx-auto">
        <Outlet />
      </main>
    </div>
  );
}
