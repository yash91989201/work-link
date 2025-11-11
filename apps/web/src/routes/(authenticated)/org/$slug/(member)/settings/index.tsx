import { createFileRoute } from "@tanstack/react-router";
import { ThemeSettings } from "@/components/shared/theme-settings";

export const Route = createFileRoute(
  "/(authenticated)/org/$slug/(member)/settings/"
)({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="container mx-auto py-8">
      <ThemeSettings />
    </div>
  );
}
