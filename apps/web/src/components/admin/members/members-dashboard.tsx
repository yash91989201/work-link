import { InvitationListTable } from "@/components/admin/invitation-list-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { InviteMemberForm } from "./invite-member-form";

export const MembersDashboard = () => {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="py-4">
        <div>
          <h1 className="mt-2 font-bold text-2xl">Members Management</h1>
          <p className="text-muted-foreground">
            Manage organization members, invitations, and roles
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Member Invitations</CardTitle>
          <CardDescription>
            Manage member invitations and track status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex justify-end">
            <InviteMemberForm />
          </div>
          <InvitationListTable />
        </CardContent>
      </Card>
    </div>
  );
};
