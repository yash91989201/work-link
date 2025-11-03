import {
  AlertTriangle,
  CheckCircle,
  Crown,
  Loader2,
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
import { Textarea } from "@/components/ui/textarea";

interface RoleManagementDialogProps {
  children: React.ReactNode;
  member: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    currentRole: string;
    team: string;
  };
  onRoleChange?: (memberId: string, newRole: string, reason: string) => void;
}

interface RoleChangeForm {
  newRole: string;
  reason: string;
  notifyMember: boolean;
  effectiveDate: string;
  temporaryRole: boolean;
  temporaryDuration?: string;
}

const roleDefinitions = {
  admin: {
    title: "Administrator",
    description: "Full access to all organization features and settings",
    icon: Crown,
    color: "text-red-600",
    bgColor: "bg-red-100",
    permissions: [
      "Manage organization settings",
      "Add/remove members",
      "Manage teams and projects",
      "Access billing and invoices",
      "View all analytics and reports",
      "Manage integrations and API keys",
    ],
  },
  manager: {
    title: "Manager",
    description: "Team and department management capabilities",
    icon: Shield,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    permissions: [
      "Manage team members",
      "Create and manage projects",
      "Approve time off and requests",
      "View team analytics",
      "Manage team budget",
      "Assign tasks and responsibilities",
    ],
  },
  "team-lead": {
    title: "Team Lead",
    description: "Team leadership and project management",
    icon: UserPlus,
    color: "text-green-600",
    bgColor: "bg-green-100",
    permissions: [
      "Lead team members",
      "Manage project timelines",
      "Assign tasks within team",
      "Review and approve work",
      "Conduct performance reviews",
      "Mentor junior team members",
    ],
  },
  member: {
    title: "Member",
    description: "Standard team member access",
    icon: Users,
    color: "text-gray-600",
    bgColor: "bg-gray-100",
    permissions: [
      "View assigned tasks",
      "Update own profile",
      "Participate in team discussions",
      "Access team resources",
      "Submit time tracking",
      "Collaborate on projects",
    ],
  },
};

export const RoleManagementDialog = ({
  children,
  member,
  onRoleChange,
}: RoleManagementDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");

  const { register, handleSubmit, reset, watch, setValue } =
    useForm<RoleChangeForm>({
      defaultValues: {
        newRole: "",
        reason: "",
        notifyMember: true,
        effectiveDate: new Date().toISOString().split("T")[0],
        temporaryRole: false,
        temporaryDuration: "",
      },
    });

  const watchedNewRole = watch("newRole");
  const watchedTemporaryRole = watch("temporaryRole");

  const handleRoleChange = async (data: RoleChangeForm) => {
    if (!selectedRole) {
      toast.error("Please select a role");
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      console.log("Changing role:", {
        memberId: member.id,
        newRole: data.newRole,
        reason: data.reason,
        notifyMember: data.notifyMember,
        effectiveDate: data.effectiveDate,
        temporaryRole: data.temporaryRole,
        temporaryDuration: data.temporaryDuration,
      });

      toast.success(
        `Role changed to ${roleDefinitions[data.newRole as keyof typeof roleDefinitions]?.title} successfully`
      );

      onRoleChange?.(member.id, data.newRole, data.reason);
      reset();
      setSelectedRole("");
      setOpen(false);
    } catch (error) {
      toast.error("Failed to change role");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleIcon = (role: string) => {
    const roleDef = roleDefinitions[role as keyof typeof roleDefinitions];
    return roleDef ? (
      <roleDef.icon className="h-4 w-4" />
    ) : (
      <Users className="h-4 w-4" />
    );
  };

  const getRoleColor = (role: string) => {
    const roleDef = roleDefinitions[role as keyof typeof roleDefinitions];
    return roleDef?.color || "text-gray-600";
  };

  const getRoleBgColor = (role: string) => {
    const roleDef = roleDefinitions[role as keyof typeof roleDefinitions];
    return roleDef?.bgColor || "bg-gray-100";
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Change Role
          </DialogTitle>
          <DialogDescription>
            Update role and permissions for {member.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Member Info */}
          <div className="flex items-center gap-3 rounded-lg border bg-muted/50 p-4">
            <Avatar>
              <AvatarImage src={member.avatar} />
              <AvatarFallback>
                {member.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium">{member.name}</p>
              <p className="text-muted-foreground text-sm">{member.email}</p>
              <div className="mt-1 flex items-center gap-2">
                <Badge variant="outline">{member.team}</Badge>
                <Badge className="flex items-center gap-1" variant="secondary">
                  {getRoleIcon(member.currentRole)}
                  {
                    roleDefinitions[
                      member.currentRole as keyof typeof roleDefinitions
                    ]?.title
                  }
                </Badge>
              </div>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit(handleRoleChange)}>
            {/* Role Selection */}
            <div className="space-y-4">
              <Label className="font-medium text-base">Select New Role</Label>
              <div className="grid grid-cols-1 gap-3">
                {Object.entries(roleDefinitions).map(([role, definition]) => (
                  <div
                    className={`cursor-pointer rounded-lg border p-4 transition-colors ${
                      selectedRole === role
                        ? "border-primary bg-primary/5"
                        : "hover:bg-muted/50"
                    }`}
                    key={role}
                    onClick={() => {
                      setSelectedRole(role);
                      setValue("newRole", role);
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`rounded-full p-2 ${getRoleBgColor(role)}`}
                      >
                        <definition.icon
                          className={`h-4 w-4 ${getRoleColor(role)}`}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{definition.title}</h3>
                          {selectedRole === role && (
                            <CheckCircle className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        <p className="mt-1 text-muted-foreground text-sm">
                          {definition.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Role Details */}
            {watchedNewRole && (
              <Card className="border-dashed">
                <CardContent className="p-4">
                  <h4 className="mb-3 flex items-center gap-2 font-medium">
                    {getRoleIcon(watchedNewRole)}
                    {
                      roleDefinitions[
                        watchedNewRole as keyof typeof roleDefinitions
                      ]?.title
                    }{" "}
                    Permissions
                  </h4>
                  <ul className="space-y-2">
                    {roleDefinitions[
                      watchedNewRole as keyof typeof roleDefinitions
                    ]?.permissions.map((permission, index) => (
                      <li
                        className="flex items-center gap-2 text-sm"
                        key={index}
                      >
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        {permission}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Role Change Details */}
            <div className="space-y-4">
              <Label className="font-medium text-base">
                Role Change Details
              </Label>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="effectiveDate">Effective Date</Label>
                  <Input
                    id="effectiveDate"
                    type="date"
                    {...register("effectiveDate", {
                      required: "Effective date is required",
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="temporaryDuration">Duration</Label>
                  <div className="space-y-2">
                    <Checkbox
                      id="temporaryRole"
                      {...register("temporaryRole")}
                      onCheckedChange={(checked) => {
                        if (!checked) {
                          setValue("temporaryDuration", "");
                        }
                      }}
                    />
                    <Label className="text-sm" htmlFor="temporaryRole">
                      Temporary role assignment
                    </Label>
                  </div>
                  {watchedTemporaryRole && (
                    <Select
                      onValueChange={(value) =>
                        setValue("temporaryDuration", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-week">1 week</SelectItem>
                        <SelectItem value="2-weeks">2 weeks</SelectItem>
                        <SelectItem value="1-month">1 month</SelectItem>
                        <SelectItem value="3-months">3 months</SelectItem>
                        <SelectItem value="6-months">6 months</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Change</Label>
                <Textarea
                  id="reason"
                  placeholder="Explain why this role change is necessary..."
                  {...register("reason", { required: "Reason is required" })}
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="notifyMember" {...register("notifyMember")} />
                <Label htmlFor="notifyMember">
                  Notify member via email about role change
                </Label>
              </div>
            </div>

            {/* Warning for sensitive roles */}
            {(watchedNewRole === "admin" || watchedNewRole === "manager") && (
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 h-4 w-4 text-orange-600" />
                    <div className="text-sm">
                      <p className="font-medium text-orange-800">
                        Important Notice
                      </p>
                      <p className="text-orange-700">
                        This role provides significant administrative access.
                        Please ensure the member has completed proper training
                        and understands their responsibilities.
                      </p>
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
              <Button disabled={isSubmitting || !watchedNewRole} type="submit">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating Role...
                  </>
                ) : (
                  "Change Role"
                )}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
