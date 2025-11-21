import { createFileRoute } from "@tanstack/react-router";
import {
  AttendanceAnalyticsView,
  RANGE_OPTIONS,
  rangeToInput,
} from "@/components/member/attendance/attendance-analytics-view";

export const Route = createFileRoute(
  "/(authenticated)/org/$slug/(admin)/dashboard/attendance/analytics"
)({
  beforeLoad: ({ context: { queryClient, queryUtils } }) => {
    queryClient.prefetchQuery(
      queryUtils.member.attendance.getAnalytics.queryOptions({
        input: rangeToInput(RANGE_OPTIONS[0].value),
      })
    );
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <AttendanceAnalyticsView />;
}
