import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/(authenticated)/org/$slug/(member)/(base-modules)/attendance/analytics"
)({
  component: AnalyticsPage,
});

function AnalyticsPage() {
  return <div>work in progress</div>;
}
