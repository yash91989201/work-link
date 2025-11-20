import { IconCirclePlus } from "@tabler/icons-react";
import { useMutation, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import {
  Clock,
  Coffee,
  LogOut,
  Moon,
  Pause,
  PhoneCall,
  Play,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
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
          <SidebarMenuItem>
            <WorkBlockToggle />
          </SidebarMenuItem>
          <SidebarMenuItem>
            <PresenceStatusDropdown />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

function WorkBlockToggle() {
  const { state } = useSidebar();
  const { data: attendance, refetch: refetchAttendance } = useSuspenseQuery(
    queryUtils.member.attendance.getStatus.queryOptions({})
  );

  const { data: activeBlock, refetch: refetchBlock } = useQuery(
    queryUtils.member.workBlock.getActiveBlock.queryOptions({
      input: {
        attendanceId: attendance?.id ?? "",
      },
      enabled: !!attendance?.id,
    })
  );

  const [elapsed, setElapsed] = useState<string>("00:00:00");

  useEffect(() => {
    if (!activeBlock?.startedAt) {
      setElapsed("00:00:00");
      return;
    }

    const interval = setInterval(() => {
      const start = new Date(activeBlock.startedAt).getTime();
      const now = Date.now();
      const diff = now - start;

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setElapsed(
        `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [activeBlock]);

  const { mutateAsync: startBlock, isPending: isStarting } = useMutation(
    queryUtils.member.workBlock.startBlock.mutationOptions({
      onSuccess: async () => {
        toast.success("Work session started");
        await Promise.all([refetchAttendance(), refetchBlock()]);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  const { mutateAsync: endBlock, isPending: isEnding } = useMutation(
    queryUtils.member.workBlock.endBlock.mutationOptions({
      onSuccess: async () => {
        toast.success("Work session paused");
        await Promise.all([refetchAttendance(), refetchBlock()]);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  const hasCheckedIn = !!attendance?.checkInTime;
  const hasCheckedOut = !!attendance?.checkOutTime;
  const canToggle = hasCheckedIn && !hasCheckedOut;
  const isPending = isStarting || isEnding;
  const isWorking = !!activeBlock;

  if (!canToggle) {
    return null;
  }

  const handleToggle = async () => {
    if (!attendance?.id) return;

    if (isWorking) {
      await endBlock({
        attendanceId: attendance.id,
        endReason: "manual",
      });
    } else {
      await startBlock({ attendanceId: attendance.id });
    }
  };

  const tooltipContent = isWorking ? `Working (${elapsed})` : "Start Work";

  return (
    <SidebarMenuButton
      className={isWorking ? "text-amber-600 hover:text-amber-700" : ""}
      disabled={isPending}
      onClick={handleToggle}
      tooltip={state === "collapsed" ? tooltipContent : undefined}
    >
      {isWorking ? <Pause className="animate-pulse" /> : <Play />}
      <span>{isWorking ? "Pause Work" : "Start Work"}</span>
      {isWorking && state === "expanded" && (
        <span className="ml-auto font-mono text-muted-foreground text-xs">
          {elapsed}
        </span>
      )}
    </SidebarMenuButton>
  );
}

function PresenceStatusDropdown() {
  const { data: attendance } = useSuspenseQuery(
    queryUtils.member.attendance.getStatus.queryOptions({})
  );

  const { mutateAsync: setManualStatus, isPending } = useMutation(
    queryUtils.member.presence.setManualStatus.mutationOptions({
      onSuccess: () => {
        toast.success("Status updated");
      },
    })
  );

  const hasCheckedIn = !!attendance?.checkInTime;
  const hasCheckedOut = !!attendance?.checkOutTime;
  const canSetStatus = hasCheckedIn && !hasCheckedOut;

  if (!canSetStatus) {
    return null;
  }

  const handleStatusChange = async (status: "dnd" | "busy" | "away" | null) => {
    const orgId = attendance?.organizationId;
    if (!orgId) return;

    await setManualStatus({ orgId, status });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton disabled={isPending}>
          <Coffee />
          <span>Update Status</span>
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-48"
        side="right"
        sideOffset={12}
      >
        <DropdownMenuLabel>Set Status</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleStatusChange(null)}>
          <Clock className="mr-2 h-4 w-4 text-green-600" />
          Available
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusChange("away")}>
          <Moon className="mr-2 h-4 w-4 text-yellow-600" />
          Away
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusChange("busy")}>
          <XCircle className="mr-2 h-4 w-4 text-red-600" />
          Busy
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusChange("dnd")}>
          <PhoneCall className="mr-2 h-4 w-4 text-red-700" />
          Do Not Disturb
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
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
