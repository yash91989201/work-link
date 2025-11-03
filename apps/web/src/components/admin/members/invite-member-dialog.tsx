import {
  Building2,
  Check,
  Copy,
  Crown,
  Loader2,
  Mail,
  Send,
  Shield,
  UserPlus,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

interface InviteMemberDialogProps {
  children: React.ReactNode;
}

// Mock data for teams
const mockTeams = [
  { id: "1", name: "Engineering", members: 12 },
  { id: "2", name: "Design", members: 6 },
  { id: "3", name: "Marketing", members: 8 },
  { id: "4", name: "Sales", members: 10 },
  { id: "5", name: "Operations", members: 5 },
];

// Mock data for existing members
const mockMembers = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah@example.com",
    avatar: "",
    role: "Team Lead",
  },
  {
    id: "2",
    name: "Mike Chen",
    email: "mike@example.com",
    avatar: "",
    role: "Senior Designer",
  },
  {
    id: "3",
    name: "Emily Davis",
    email: "emily@example.com",
    avatar: "",
    role: "Marketing Manager",
  },
];

export const InviteMemberDialog = ({ children }: InviteMemberDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inviteMethod, setInviteMethod] = useState<"email" | "link">("email");
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [copiedLink, setCopiedLink] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
    setValue,
  } = useForm<{
    emails: string;
    role: string;
    message: string;
    teamIds: string[];
    sendWelcomeEmail: boolean;
  }>();

  const watchedRole = watch("role");
  const watchedEmails = watch("emails", "");

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Crown className="h-4 w-4 text-red-600" />;
      case "manager":
        return <Shield className="h-4 w-4 text-blue-600" />;
      case "team-lead":
        return <UserPlus className="h-4 w-4 text-green-600" />;
      default:
        return <Users className="h-4 w-4 text-gray-600" />;
    }
  };

  const handleTeamToggle = (teamId: string) => {
    setSelectedTeams((prev) =>
      prev.includes(teamId)
        ? prev.filter((id) => id !== teamId)
        : [...prev, teamId]
    );
  };

  const handleEmailInvitation = async (data: any) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log("Sending invitations:", {
        emails: data.emails.split(",").map((e: string) => e.trim()),
        role: data.role,
        teams: selectedTeams,
        message: data.message,
        sendWelcomeEmail: data.sendWelcomeEmail,
      });

      toast.success(
        `${data.emails.split(",").length} invitation(s) sent successfully`
      );
      reset();
      setSelectedTeams([]);
      setOpen(false);
    } catch (error) {
      toast.error("Failed to send invitations");
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateInvitationLink = () => {
    const mockLink = `https://worklink.app/invite/${Math.random().toString(36).substring(7)}?email=${watchedEmails}`;
    navigator.clipboard.writeText(mockLink);
    setCopiedLink(true);
    toast.success("Invitation link copied to clipboard");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const filteredMembers = mockMembers.filter(
    (member) =>
      member.name.toLowerCase().includes(watchedEmails.toLowerCase()) ||
      member.email.toLowerCase().includes(watchedEmails.toLowerCase())
  );

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Invite Members
          </DialogTitle>
          <DialogDescription>
            Send invitations to add new members to your organization
          </DialogDescription>
        </DialogHeader>

        <Tabs
          onValueChange={(value) => setInviteMethod(value as "email" | "link")}
          value={inviteMethod}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger className="flex items-center gap-2" value="email">
              <Mail className="h-4 w-4" />
              Email Invitation
            </TabsTrigger>
            <TabsTrigger className="flex items-center gap-2" value="link">
              <Copy className="h-4 w-4" />
              Share Link
            </TabsTrigger>
          </TabsList>

          <TabsContent className="space-y-6" value="email">
            <form
              className="space-y-6"
              onSubmit={handleSubmit(handleEmailInvitation)}
            >
              {/* Email Input */}
              <div className="space-y-2">
                <Label htmlFor="emails">Email Addresses</Label>
                <Input
                  id="emails"
                  placeholder="Enter email addresses separated by commas"
                  {...register("emails", {
                    required: "At least one email is required",
                    pattern: {
                      value:
                        /^[^\s@]+@[^\s@]+\.[^\s@]+([,\s][^\s@]+@[^\s@]+\.[^\s@]+)*$/,
                      message:
                        "Please enter valid email addresses separated by commas",
                    },
                  })}
                  className="min-h-[44px]"
                />
                {errors.emails && (
                  <p className="text-destructive text-sm">
                    {errors.emails.message}
                  </p>
                )}

                {/* Existing Members Suggestion */}
                {watchedEmails && filteredMembers.length > 0 && (
                  <div className="mt-2 rounded-lg bg-muted/50 p-3">
                    <p className="mb-2 font-medium text-sm">
                      Existing members found:
                    </p>
                    <div className="space-y-2">
                      {filteredMembers.map((member) => (
                        <div
                          className="flex items-center justify-between rounded border bg-background p-2"
                          key={member.id}
                        >
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={member.avatar} />
                              <AvatarFallback className="text-xs">
                                {member.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">
                                {member.name}
                              </p>
                              <p className="text-muted-foreground text-xs">
                                {member.email}
                              </p>
                            </div>
                          </div>
                          <Badge className="text-xs" variant="outline">
                            {member.role}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Role Selection */}
              <div className="space-y-2">
                <Label htmlFor="role">Default Role</Label>
                <Select
                  defaultValue="member"
                  onValueChange={(value) => setValue("role", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Member
                      </div>
                    </SelectItem>
                    <SelectItem value="team-lead">
                      <div className="flex items-center gap-2">
                        <UserPlus className="h-4 w-4" />
                        Team Lead
                      </div>
                    </SelectItem>
                    <SelectItem value="manager">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Manager
                      </div>
                    </SelectItem>
                    <SelectItem value="admin">
                      <div className="flex items-center gap-2">
                        <Crown className="h-4 w-4" />
                        Admin
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Team Assignment */}
              <div className="space-y-2">
                <Label>Assign to Teams</Label>
                <div className="max-h-40 space-y-2 overflow-y-auto rounded-lg border p-3">
                  {mockTeams.map((team) => (
                    <div
                      className="flex items-center justify-between"
                      key={team.id}
                    >
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={selectedTeams.includes(team.id)}
                          id={team.id}
                          onCheckedChange={() => handleTeamToggle(team.id)}
                        />
                        <Label className="cursor-pointer" htmlFor={team.id}>
                          {team.name}
                        </Label>
                      </div>
                      <Badge className="text-xs" variant="outline">
                        {team.members} members
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Personal Message */}
              <div className="space-y-2">
                <Label htmlFor="message">Personal Message (Optional)</Label>
                <Textarea
                  id="message"
                  placeholder="Add a personal message to the invitation..."
                  {...register("message")}
                  rows={3}
                />
              </div>

              {/* Welcome Email Option */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sendWelcomeEmail"
                  {...register("sendWelcomeEmail")}
                  defaultChecked
                />
                <Label htmlFor="sendWelcomeEmail">
                  Send welcome email with onboarding instructions
                </Label>
              </div>

              {/* Role Preview */}
              {watchedRole && (
                <Card className="border-dashed">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getRoleIcon(watchedRole)}
                        <div>
                          <p className="font-medium text-sm capitalize">
                            {watchedRole}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {watchedRole === "admin" &&
                              "Full organization access"}
                            {watchedRole === "manager" &&
                              "Team and department management"}
                            {watchedRole === "team-lead" &&
                              "Team leadership and project management"}
                            {watchedRole === "member" &&
                              "Standard member access"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <DialogFooter>
                <Button
                  onClick={() => setOpen(false)}
                  type="button"
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button disabled={isSubmitting} type="submit">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending Invitations...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Invitations
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          <TabsContent className="space-y-6" value="link">
            <div className="space-y-4">
              <div className="rounded-lg bg-muted/50 p-6 text-center">
                <Mail className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 font-medium text-lg">
                  Share Invitation Link
                </h3>
                <p className="mb-4 text-muted-foreground text-sm">
                  Generate a link that you can share with potential members
                </p>
                <Button
                  className="w-full"
                  onClick={generateInvitationLink}
                  variant={copiedLink ? "default" : "outline"}
                >
                  {copiedLink ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Link Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Invitation Link
                    </>
                  )}
                </Button>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-medium">How it works:</h4>
                <div className="space-y-2 text-muted-foreground text-sm">
                  <div className="flex items-start gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary font-medium text-primary-foreground text-xs">
                      1
                    </span>
                    <p>
                      Click "Copy Invitation Link" to generate a unique
                      invitation URL
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary font-medium text-primary-foreground text-xs">
                      2
                    </span>
                    <p>
                      Share the link with potential members via email, messaging
                      apps, or social media
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary font-medium text-primary-foreground text-xs">
                      3
                    </span>
                    <p>
                      They can click the link to accept the invitation and join
                      your organization
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-medium">Benefits:</h4>
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center gap-2 rounded-lg border p-2">
                    <Users className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Batch invitations</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border p-2">
                    <Building2 className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">Perfect for remote teams</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border p-2">
                    <Shield className="h-4 w-4 text-purple-600" />
                    <span className="text-sm">Secure and trackable</span>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button onClick={() => setOpen(false)} variant="outline">
                Close
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
