import { createFileRoute } from "@tanstack/react-router";
import { MemberMarkAttendance } from "@/components/member/attendance/mark-attendance";

export const Route = createFileRoute(
  "/(authenticated)/org/$slug/(member)/(base-modules)/attendance/"
)({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <section className="mx-auto flex h-full max-w-xl flex-col items-center justify-center gap-6 text-center">
      <MemberMarkAttendance />
    </section>
  );
}
