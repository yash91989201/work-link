import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { Greeting } from "@/components/member/attendance/greeting";
import {
  MarkAttendance,
  MarkAttendanceSkeleton,
} from "@/components/member/attendance/mark-attendance";
import {
  MemberPresenceList,
  MemberPresenceListSkeleton,
} from "@/components/member/attendance/member-presence-list";
import {
  WorkBlocksList,
  WorkBlocksListSkeleton,
} from "@/components/member/attendance/work-blocks-list";

export const Route = createFileRoute(
  "/(authenticated)/org/$slug/(member)/(base-modules)/attendance/"
)({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="container mx-auto space-y-6 p-6">
      <Greeting />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Suspense fallback={<MarkAttendanceSkeleton />}>
            <MarkAttendance />
          </Suspense>
          <Suspense fallback={<WorkBlocksListSkeleton />}>
            <WorkBlocksList />
          </Suspense>
        </div>
        <div className="space-y-6 lg:col-span-1">
          <Suspense fallback={<MemberPresenceListSkeleton />}>
            <MemberPresenceList />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
