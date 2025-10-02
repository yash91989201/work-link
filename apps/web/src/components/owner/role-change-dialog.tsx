import { useState } from "react";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface Member {
  id: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "member";
}

interface RoleChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: Member;
}

const roleChangeSchema = {
  type: "object",
  properties: {
    newRole: {
      type: "string",
      enum: ["admin", "member"],
      description: "New role for the member",
    },
  },
  required: ["newRole"],
};

type RoleChangeFormType = {
  newRole: "admin" | "member";
};

export const RoleChangeDialog = ({ open, onOpenChange, member }: RoleChangeDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RoleChangeFormType>({
    resolver: standardSchemaResolver(roleChangeSchema),
    defaultValues: {
      newRole: member.role === "owner" ? "admin" : member.role,
    },
  });

  const onSubmit = async (data: RoleChangeFormType) => {
    setIsLoading(true);
    try {
      // Replace with actual API call
      console.log("Changing role for", member.email, "to", data.newRole);
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      toast.success(`Role updated to ${data.newRole} successfully!`);
      onOpenChange(false);
    } catch (_error) {
      toast.error("Failed to update role. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "owner":
        return "default";
      case "admin":
        return "secondary";
      case "member":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Change Member Role</DialogTitle>
          <DialogDescription>
            Update the role for {member.name}. This will affect their permissions within the organization.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-lg border">
            <div className="flex-1">
              <p className="font-medium">{member.name}</p>
              <p className="text-sm text-muted-foreground">{member.email}</p>
            </div>
            <Badge variant={getRoleBadgeVariant(member.role)}>
              {member.role}
            </Badge>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="newRole"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select new role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="p-3 rounded-lg bg-muted/50">
                <h4 className="font-medium text-sm mb-2">Role Permissions:</h4>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p><strong>Admin:</strong> Can manage members, teams, and invitations</p>
                  <p><strong>Member:</strong> Can view and participate in assigned teams</p>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating Role...
                    </>
                  ) : (
                    "Update Role"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};