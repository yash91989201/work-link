import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute(
  "/(authenticated)/org/$slug/(owner)/manage/settings/security"
)({
  component: SecuritySettings,
});

function SecuritySettings() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1.5">
        <h2 className="font-semibold text-xl tracking-tight">Security</h2>
        <p className="text-muted-foreground">
          Security and authentication settings
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Two-Factor Authentication</p>
            <p className="text-muted-foreground text-sm">
              Require 2FA for all members
            </p>
          </div>
          <Button size="sm" variant="outline">
            Configure
          </Button>
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Session Timeout</p>
            <p className="text-muted-foreground text-sm">
              Auto-logout after inactivity
            </p>
          </div>
          <Badge variant="outline">24 hours</Badge>
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">IP Whitelist</p>
            <p className="text-muted-foreground text-sm">
              Restrict access to specific IPs
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
