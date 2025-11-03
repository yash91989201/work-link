import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute(
  "/(authenticated)/org/$slug/(owner)/manage/settings/appearance"
)({
  component: AppearanceSettings,
});

function AppearanceSettings() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1.5">
        <h2 className="font-semibold text-xl tracking-tight">Appearance</h2>
        <p className="text-muted-foreground">Customize the look and feel</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Theme</p>
            <p className="text-muted-foreground text-sm">
              Default color scheme for the organization
            </p>
          </div>
          <Badge variant="outline">System</Badge>
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Custom Logo</p>
            <p className="text-muted-foreground text-sm">
              Upload organization logo
            </p>
          </div>
          <Button size="sm" variant="outline">
            Upload
          </Button>
        </div>
      </div>
    </div>
  );
}
