import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CalendarDay {
  date: number;
  isCurrentMonth: boolean;
  attendance?: {
    status: "present" | "absent" | "late" | "half-day" | "leave";
    checkIn?: string;
    checkOut?: string;
    hours?: number;
  };
}

export function AttendanceCalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const generateCalendarDays = (): CalendarDay[] => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days: CalendarDay[] = [];

    // Previous month days
    const prevMonth = new Date(year, month - 1);
    const daysInPrevMonth = getDaysInMonth(prevMonth);
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        date: daysInPrevMonth - i,
        isCurrentMonth: false,
      });
    }

    // Current month days
    const attendanceData = generateAttendanceData();
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: i,
        isCurrentMonth: true,
        attendance: attendanceData[i],
      });
    }

    // Next month days
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: i,
        isCurrentMonth: false,
      });
    }

    return days;
  };

  const generateAttendanceData = () => {
    const data: Record<number, any> = {};
    const statuses = [
      "present",
      "absent",
      "late",
      "half-day",
      "leave",
    ] as const;

    for (let i = 1; i <= getDaysInMonth(currentDate); i++) {
      if (Math.random() > 0.1) {
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        data[i] = {
          status,
          checkIn:
            status === "present" || status === "late"
              ? `${9 + Math.floor(Math.random() * 2)}:${Math.floor(
                  Math.random() * 60
                )
                  .toString()
                  .padStart(2, "0")} AM`
              : undefined,
          checkOut:
            status !== "absent" && status !== "leave"
              ? `${5 + Math.floor(Math.random() * 3)}:${Math.floor(
                  Math.random() * 60
                )
                  .toString()
                  .padStart(2, "0")} PM`
              : undefined,
          hours:
            status !== "absent" && status !== "leave"
              ? 6 + Math.random() * 4
              : 0,
        };
      }
    }

    return data;
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "present":
        return "bg-green-500";
      case "absent":
        return "bg-red-500";
      case "late":
        return "bg-yellow-500";
      case "half-day":
        return "bg-orange-500";
      case "leave":
        return "bg-blue-500";
      default:
        return "bg-gray-200";
    }
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const calendarDays = generateCalendarDays();
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Attendance Calendar
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => navigateMonth("prev")}
                size="sm"
                variant="outline"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="min-w-[120px] text-center font-medium text-sm">
                {monthNames[month]} {year}
              </span>
              <Button
                onClick={() => navigateMonth("next")}
                size="sm"
                variant="outline"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1">
            {weekDays.map((day) => (
              <div
                className="py-2 text-center font-medium text-gray-500 text-xs"
                key={day}
              >
                {day}
              </div>
            ))}

            {calendarDays.map((day, index) => (
              <div
                className={`relative aspect-square rounded-md border p-1 ${day.isCurrentMonth ? "bg-white" : "bg-gray-50"}
                  ${day.isCurrentMonth && day.date === new Date().getDate() && month === new Date().getMonth() ? "ring-2 ring-blue-500" : ""}hover:bg-gray-100 cursor-pointer transition-colors`}
                key={index.toString()}
              >
                <div className="mb-1 text-center text-xs">{day.date}</div>
                {day.attendance && (
                  <div className="flex justify-center">
                    <div
                      className={`h-2 w-2 rounded-full ${getStatusColor(day.attendance.status)}`}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-4 border-t pt-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <span className="text-sm">Present</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <span className="text-sm">Absent</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-yellow-500" />
              <span className="text-sm">Late</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-orange-500" />
              <span className="text-sm">Half Day</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-blue-500" />
              <span className="text-sm">Leave</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Selected Day Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-gray-500">
            Click on a calendar date to view detailed attendance information
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

