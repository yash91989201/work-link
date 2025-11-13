import { createFileRoute } from "@tanstack/react-router";
import { Preferences } from "@/components/settings/preferences";

export const Route = createFileRoute("/(authenticated)/settings/preferences")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="container mx-auto max-w-3xl py-8">
      <div className="space-y-6">
        <h2 className="font-semibold text-2xl tracking-tight">Preferences</h2>

        <Preferences />
      </div>
    </div>
  );
}
