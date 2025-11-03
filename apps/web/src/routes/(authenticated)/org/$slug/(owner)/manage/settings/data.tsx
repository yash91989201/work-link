import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute(
  "/(authenticated)/org/$slug/(owner)/manage/settings/data"
)({
  component: DataSettings,
});

function DataSettings() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1.5">
        <h2 className="font-semibold text-xl tracking-tight">Data & Storage</h2>
        <p className="text-muted-foreground">
          Manage data retention and storage
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Export Data</p>
            <p className="text-muted-foreground text-sm">
              Download all organization data
            </p>
          </div>
          <Button size="sm" variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Data Retention</p>
            <p className="text-muted-foreground text-sm">
              How long to keep inactive data
            </p>
          </div>
          <Badge variant="outline">1 year</Badge>
        </div>
      </div>
    </div>
  );
}
