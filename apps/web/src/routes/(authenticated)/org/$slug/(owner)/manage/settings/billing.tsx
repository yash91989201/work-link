import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute(
  "/(authenticated)/org/$slug/(owner)/manage/settings/billing"
)({
  component: BillingSettings,
});

function BillingSettings() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1.5">
        <h2 className="font-semibold text-xl tracking-tight">
          Billing & Subscription
        </h2>
        <p className="text-muted-foreground">
          Manage your subscription and payment methods
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Current Plan</p>
            <p className="text-muted-foreground text-sm">
              Your active subscription plan
            </p>
          </div>
          <Badge variant="default">Pro</Badge>
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Payment Method</p>
            <p className="text-muted-foreground text-sm">
              Update payment information
            </p>
          </div>
          <Button size="sm" variant="outline">
            Update
          </Button>
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Usage Statistics</p>
            <p className="text-muted-foreground text-sm">
              View resource consumption
            </p>
          </div>
          <Button size="sm" variant="outline">
            View
          </Button>
        </div>
      </div>
    </div>
  );
}