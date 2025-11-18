import { IconCirclePlus } from "@tabler/icons-react";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { Clock, LogOut } from "lucide-react";
import { toast } from "sonner";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Spinner } from "@/components/ui/spinner";
import { queryUtils } from "@/utils/orpc";

export function NavQuickActions() {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <MarkAttendanceButton />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

function MarkAttendanceButton() {
  const { data: attendance, refetch } = useSuspenseQuery(
    queryUtils.member.attendance.getStatus.queryOptions({})
  );

  const { mutateAsync: punchIn, isPending: isPunchingIn } = useMutation(
    queryUtils.member.attendance.punchIn.mutationOptions({
      onSuccess: async () => {
        toast.success("Checked in successfully!");
        await refetch();
      },
    })
  );

  const { mutateAsync: punchOut, isPending: isPunchingOut } = useMutation(
    queryUtils.member.attendance.punchOut.mutationOptions({
      onSuccess: async () => {
        toast.success("Checked out successfully!");
        await refetch();
      },
    })
  );

  const hasCheckedIn = !!attendance?.checkInTime;
  const hasCheckedOut = !!attendance?.checkOutTime;
  const isActionPending = isPunchingIn || isPunchingOut;

  if (!hasCheckedIn) {
    return (
      <SidebarMenuButton
        className="min-w-8 bg-green-600 text-primary-foreground duration-200 ease-linear hover:bg-green-700 hover:text-primary-foreground active:bg-green-700 active:text-primary-foreground"
        disabled={isActionPending}
        onClick={() => punchIn({})}
        tooltip="Punch In"
      >
        {isPunchingIn ? (
          <>
            <Spinner className="mr-2" />
            <span>Punching In…</span>
          </>
        ) : (
          <>
            <Clock />
            <span>Punch In</span>
          </>
        )}
      </SidebarMenuButton>
    );
  }

  if (hasCheckedIn && !hasCheckedOut) {
    return (
      <SidebarMenuButton
        className="min-w-8 bg-red-600 text-primary-foreground duration-200 ease-linear hover:bg-red-700 hover:text-primary-foreground active:bg-red-700 active:text-primary-foreground"
        disabled={isActionPending}
        onClick={() => punchOut({})}
        tooltip="Punch Out"
      >
        {isPunchingOut ? (
          <>
            <Spinner className="mr-2 h-4 w-4 animate-spin" />
            <span>Punching Out…</span>
          </>
        ) : (
          <>
            <LogOut />
            <span>Punch Out</span>
          </>
        )}
      </SidebarMenuButton>
    );
  }

  return (
    <SidebarMenuButton
      className="min-w-8 bg-gray-600 text-primary-foreground duration-200 ease-linear hover:bg-gray-700 hover:text-primary-foreground"
      disabled
      tooltip="Attendance Complete"
    >
      <IconCirclePlus />
      <span>Attendance Complete</span>
    </SidebarMenuButton>
  );
}
