import { Suspense } from "react";
import {
  InvitationListTable,
  InvitationListTableSkeleton,
} from "@/components/admin/invitation-list-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { InviteAdminForm } from "./invite-admin-form";

export const InvitationManagement = () => (
  <div className="space-y-4">
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Invitation Management
            </CardTitle>
            <CardDescription>
              Manage organization invitations and track their status
            </CardDescription>
          </div>
          <InviteAdminForm />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          <Suspense fallback={<InvitationListTableSkeleton />}>
            <InvitationListTable />
          </Suspense>
        </div>
      </CardContent>
    </Card>
  </div>
);
