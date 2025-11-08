import { IconBuilding, IconUsers } from "@tabler/icons-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { queryUtils } from "@/utils/orpc";

export const Route = createFileRoute(
  "/(authenticated)/org/$slug/(admin)/dashboard/"
)({
  beforeLoad: ({ context: { queryClient, queryUtils } }) => {
    queryClient.prefetchQuery(
      queryUtils.admin.dashboard.getMemberCount.queryOptions({})
    );
    queryClient.prefetchQuery(
      queryUtils.admin.dashboard.getTeamCount.queryOptions({})
    );
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { data: memberCount } = useSuspenseQuery(
    queryUtils.admin.dashboard.getMemberCount.queryOptions({})
  );
  const { data: teamCount } = useSuspenseQuery(
    queryUtils.admin.dashboard.getTeamCount.queryOptions({})
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Total Members</CardTitle>
            <IconUsers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{memberCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Teams</CardTitle>
            <IconBuilding className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{teamCount}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
