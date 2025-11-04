import { createFileRoute } from "@tanstack/react-router";
import { Settings2 } from "lucide-react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export const Route = createFileRoute(
  "/(authenticated)/org/$slug/(admin)/dashboard/"
)({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="container mx-auto py-8">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Settings2 className="size-6" />
          </EmptyMedia>
          <EmptyTitle>Admin Dashboard</EmptyTitle>
        </EmptyHeader>
        <EmptyContent>
          <EmptyDescription>
            Admin dashboard features are currently in development. 
            Check back soon for powerful administrative tools and insights.
          </EmptyDescription>
        </EmptyContent>
      </Empty>
    </div>
  );
}
