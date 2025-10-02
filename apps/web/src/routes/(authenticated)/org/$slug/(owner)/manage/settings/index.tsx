import { createFileRoute } from "@tanstack/react-router";
import {
  Bell,
  Building,
  CreditCard,
  Database,
  Download,
  Globe,
  Palette,
  Save,
  Shield,
  Trash2,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute(
  "/(authenticated)/org/$slug/(owner)/manage/settings/"
)({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="space-y-6 py-6">
      <div className="flex flex-col gap-4">
        <h1 className="font-bold text-3xl tracking-tight">
          Organization Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your organization's configuration and preferences
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              General Settings
            </CardTitle>
            <CardDescription>
              Basic information about your organization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
            <div className="flex justify-end">
              <Button>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Member Management
            </CardTitle>
            <CardDescription>
              Configure member permissions and access
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security
            </CardTitle>
            <CardDescription>
              Security and authentication settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>
              Email and in-app notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Appearance
            </CardTitle>
            <CardDescription>Customize the look and feel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Data & Storage
            </CardTitle>
            <CardDescription>Manage data retention and storage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Integrations
            </CardTitle>
            <CardDescription>Connected services and APIs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Billing & Subscription
            </CardTitle>
            <CardDescription>
              Manage your subscription and payment methods
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
          </CardContent>
        </Card>
      </div>

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible actions that affect your entire organization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
        </CardContent>
      </Card>
    </div>
  );
}
