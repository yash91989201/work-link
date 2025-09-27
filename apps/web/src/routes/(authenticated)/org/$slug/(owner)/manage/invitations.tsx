import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import {
  InvitationListTable,
  InvitationListTableSkeleton,
} from "@/components/admin/invitation-list-table";
import { InviteAdminForm } from "@/components/owner/invite-admin-form";

export const Route = createFileRoute(
  "/(authenticated)/org/$slug/(owner)/manage/invitations"
)({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="mb-6 font-bold text-3xl">Invitations</h1>
      <div className="flex flex-col gap-3">
        <InviteAdminForm />
        <Suspense fallback={<InvitationListTableSkeleton />}>
          <InvitationListTable />
        </Suspense>
      </div>
    </div>
  );
}
