import { Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MemberListTable, MemberListTableSkeleton } from "./member-list-table";

export const MemberManagement = () => (
  <div className="space-y-4">
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Member Management</CardTitle>
            <CardDescription>
              Manage organization members and their roles
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Suspense fallback={<MemberListTableSkeleton />}>
          <MemberListTable />
        </Suspense>
      </CardContent>
    </Card>
  </div>
);
