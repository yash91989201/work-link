import { IconCirclePlus } from "@tabler/icons-react";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import {
  Clock,
  Coffee,
  LogOut,
  Moon,
  PhoneCall,
  Play,
  Square,
  XCircle,
} from "lucide-react";
import { useState } from "react";
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
} from "@/components/ui/sidebar";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
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
            <ManualStatusDropdown />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

function WorkBlockToggle() {
  const { data: attendance, refetch } = useSuspenseQuery(
    queryUtils.member.attendance.getStatus.queryOptions({})
  );

  const [isWorking, setIsWorking] = useState(false);

  const { mutateAsync: startBlock, isPending: isStarting } = useMutation(
    queryUtils.member.workBlock.startBlock.mutationOptions({
      onSuccess: async () => {
        toast.success("Work session started");
        setIsWorking(true);
        await refetch();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  const { mutateAsync: endBlock, isPending: isEnding } = useMutation(
    queryUtils.member.workBlock.endBlock.mutationOptions({
      onSuccess: async () => {
        toast.success("Work session ended");
        setIsWorking(false);
        await refetch();
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

  if (!canToggle) {
    return null;
  }

  const handleToggle = async (checked: boolean) => {
    if (!attendance?.id) return;

    if (checked) {
      await startBlock({ attendanceId: attendance.id });
    } else {
      await endBlock({
        attendanceId: attendance.id,
        endReason: "manual",
      });
    }
  };

  return (
    <div className="flex items-center justify-between px-2 py-1.5">
      <div className="flex items-center gap-2">
        {isWorking ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        <span className="text-sm">
          {isWorking ? "Working" : "Start Work"}
        </span>
      </div>
      <Switch
        checked={isWorking}
        onCheckedChange={handleToggle}
        disabled={isPending}
      />
    </div>
  );
}

function ManualStatusDropdown() {
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

  const handleStatusChange = async (
    status: "dnd" | "busy" | "away" | null
  ) => {
    // Get orgId from session or attendance
    const orgId = attendance?.organizationId;
    if (!orgId) return;

    await setManualStatus({ orgId, status });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton disabled={isPending}>
          <Coffee className="h-4 w-4" />
          <span>Set Status</span>
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuLabel>Manual Status</DropdownMenuLabel>
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
