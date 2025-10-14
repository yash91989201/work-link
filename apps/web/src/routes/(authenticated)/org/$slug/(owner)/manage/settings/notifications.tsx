import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute(
  "/(authenticated)/org/$slug/(owner)/manage/settings/notifications"
)({
  component: NotificationsSettings,
});

function NotificationsSettings() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1.5">
        <h2 className="font-semibold text-xl tracking-tight">
          Notifications
        </h2>
        <p className="text-muted-foreground">
          Email and in-app notification preferences
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Email Notifications</p>
            <p className="text-muted-foreground text-sm">
              Send email updates to members
            </p>
          </div>
          <Button size="sm" variant="outline">
            Configure
          </Button>
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Digest Frequency</p>
            <p className="text-muted-foreground text-sm">
              How often to send summary emails
            </p>
          </div>
          <Badge variant="outline">Weekly</Badge>
        </div>
      </div>
    </div>
  );
}