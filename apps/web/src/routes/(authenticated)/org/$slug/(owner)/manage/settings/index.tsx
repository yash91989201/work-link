import { createFileRoute } from "@tanstack/react-router";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute(
  "/(authenticated)/org/$slug/(owner)/manage/settings/"
)({
  component: GeneralSettings,
});

function GeneralSettings() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1.5">
        <h2 className="font-semibold text-xl tracking-tight">
          General Settings
        </h2>
        <p className="text-muted-foreground">
          Basic information about your organization
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="font-medium text-sm" htmlFor="org-name">
              Organization Name
            </label>
            <Input id="org-name" placeholder="Your Organization" />
          </div>
          <div className="space-y-2">
            <label className="font-medium text-sm" htmlFor="org-slug">
              Organization Slug
            </label>
            <Input id="org-slug" placeholder="your-org" />
          </div>
        </div>
        <div className="space-y-2">
          <label className="font-medium text-sm" htmlFor="org-description">
            Description
          </label>
          <Textarea
            id="org-description"
            placeholder="Describe your organization..."
            rows={3}
          />
        </div>

        <Button>
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}
