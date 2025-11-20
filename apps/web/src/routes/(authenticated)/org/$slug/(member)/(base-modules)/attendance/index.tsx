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
import { WorkSessionTracker } from "@/components/member/attendance/work-session-tracker";

export const Route = createFileRoute(
  "/(authenticated)/org/$slug/(member)/(base-modules)/attendance/"
)({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="space-y-6 p-6">
      <Greeting />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Suspense fallback={<MarkAttendanceSkeleton />}>
            <MarkAttendance />
          </Suspense>

          <Suspense fallback={<MarkAttendanceSkeleton />}>
            <WorkSessionTracker />
          </Suspense>
        </div>

        <div>
          <Suspense fallback={<MemberPresenceListSkeleton />}>
            <MemberPresenceList />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
