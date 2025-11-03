import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute(
  "/(authenticated)/org/$slug/(owner)/manage/settings/members"
)({
  component: MemberManagementSettings,
});

function MemberManagementSettings() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1.5">
        <h2 className="font-semibold text-xl tracking-tight">
          Member Management
        </h2>
        <p className="text-muted-foreground">
          Configure member permissions and access
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Allow Member Invitations</p>
            <p className="text-muted-foreground text-sm">
              Members can invite others to the organization
            </p>
          </div>
          <Button size="sm" variant="outline">
            Configure
          </Button>
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Default Member Role</p>
            <p className="text-muted-foreground text-sm">
              New members get this role by default
            </p>
          </div>
          <Badge variant="outline">Member</Badge>
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Require Approval</p>
            <p className="text-muted-foreground text-sm">
              Admin approval required for new members
            </p>
          </div>
          <Button size="sm" variant="outline">
            Enable
          </Button>
        </div>
      </div>
    </div>
  );
}
