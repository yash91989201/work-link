import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute(
  "/(authenticated)/org/$slug/(owner)/manage/settings/integrations"
)({
  component: IntegrationsSettings,
});

function IntegrationsSettings() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1.5">
        <h2 className="font-semibold text-xl tracking-tight">
          Integrations
        </h2>
        <p className="text-muted-foreground">
          Connected services and APIs
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Slack Integration</p>
            <p className="text-muted-foreground text-sm">
              Connect to Slack workspace
            </p>
          </div>
          <Button size="sm" variant="outline">
            Connect
          </Button>
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Calendar Sync</p>
            <p className="text-muted-foreground text-sm">
              Sync with Google/Outlook calendar
            </p>
          </div>
          <Button size="sm" variant="outline">
            Configure
          </Button>
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">API Access</p>
            <p className="text-muted-foreground text-sm">
              Manage API keys and access
            </p>
          </div>
          <Button size="sm" variant="outline">
            Manage
          </Button>
        </div>
      </div>
    </div>
  );
}