import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { Greeting } from "@/components/member/attendance/greeting";
import {
  MarkAttendance,
  MarkAttendanceSkeleton,
} from "@/components/member/attendance/mark-attendance";

export const Route = createFileRoute(
  "/(authenticated)/org/$slug/(member)/(base-modules)/attendance/"
)({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="space-y-6 p-6">
      <Greeting />

      <Suspense fallback={<MarkAttendanceSkeleton />}>
        <MarkAttendance />
      </Suspense>
    </div>
  );
}
