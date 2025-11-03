import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute(
  "/(authenticated)/org/$slug/(owner)/manage/settings/danger-zone"
)({
  component: DangerZoneSettings,
});

function DangerZoneSettings() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1.5">
        <h2 className="font-semibold text-destructive text-xl tracking-tight">
          Danger Zone
        </h2>
        <p className="text-muted-foreground">
          Irreversible actions that affect your entire organization
        </p>
      </div>

      <div className="space-y-4 rounded-lg border border-destructive/50 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Delete Organization</p>
            <p className="text-muted-foreground text-sm">
              Permanently delete your organization and all data
            </p>
          </div>
          <Button size="sm" variant="destructive">
            Delete Organization
          </Button>
        </div>
      </div>
    </div>
  );
}
