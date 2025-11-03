import { createFileRoute } from "@tanstack/react-router";
import { OwnerDashboard } from "@/components/owner";

export const Route = createFileRoute(
  "/(authenticated)/org/$slug/(owner)/manage/"
)({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="py-6">
      <OwnerDashboard />
    </div>
  );
}
