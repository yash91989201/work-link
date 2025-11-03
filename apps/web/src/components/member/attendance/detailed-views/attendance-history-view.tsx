import { Calendar, Clock, Download, Search } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AttendanceRecord {
  id: string;
  date: string;
  day: string;
  checkIn: string;
  checkOut: string;
  status: "present" | "absent" | "late" | "half-day" | "leave";
  totalHours: number;
  overtime: number;
  location?: string;
}

export function AttendanceHistoryView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [monthFilter, setMonthFilter] = useState<string>("all");

  const attendanceRecords: AttendanceRecord[] = [
    {
      id: "1",
      date: "2024-01-15",
      day: "Monday",
      checkIn: "09:00 AM",
      checkOut: "06:30 PM",
      status: "present",
      totalHours: 9.5,
      overtime: 1.5,
      location: "Office - Main Building",
    },
    {
      id: "2",
      date: "2024-01-14",
      day: "Friday",
      checkIn: "09:15 AM",
      checkOut: "06:00 PM",
      status: "late",
      totalHours: 8.75,
      overtime: 0.75,
      location: "Office - Main Building",
    },
    {
      id: "3",
      date: "2024-01-13",
      day: "Thursday",
      checkIn: "09:00 AM",
      checkOut: "01:00 PM",
      status: "half-day",
      totalHours: 4,
      overtime: 0,
      location: "Office - Main Building",
    },
    {
      id: "4",
      date: "2024-01-12",
      day: "Wednesday",
      checkIn: "-",
      checkOut: "-",
      status: "leave",
      totalHours: 0,
      overtime: 0,
      location: "Sick Leave",
    },
    {
      id: "5",
      date: "2024-01-11",
      day: "Tuesday",
      checkIn: "09:00 AM",
      checkOut: "06:15 PM",
      status: "present",
      totalHours: 9.25,
      overtime: 1.25,
      location: "Office - Main Building",
    },
    {
      id: "6",
      date: "2024-01-10",
      day: "Monday",
      checkIn: "-",
      checkOut: "-",
      status: "absent",
      totalHours: 0,
      overtime: 0,
    },
    {
      id: "7",
      date: "2024-01-08",
      day: "Saturday",
      checkIn: "10:00 AM",
      checkOut: "02:00 PM",
      status: "present",
      totalHours: 4,
      overtime: 0,
      location: "Weekend Work",
    },
  ];

  const filteredRecords = attendanceRecords.filter((record) => {
    const matchesSearch =
      record.date.includes(searchTerm) ||
      record.day.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || record.status === statusFilter;
    const matchesMonth =
      monthFilter === "all" || record.date.startsWith(monthFilter);

    return matchesSearch && matchesStatus && matchesMonth;
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "present":
        return "default";
      case "absent":
        return "destructive";
      case "late":
        return "secondary";
      case "half-day":
        return "outline";
      case "leave":
        return "outline";
      default:
        return "outline";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "text-green-600";
      case "absent":
        return "text-red-600";
      case "late":
        return "text-yellow-600";
      case "half-day":
        return "text-orange-600";
      case "leave":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  const totalStats = {
    present: filteredRecords.filter((r) => r.status === "present").length,
    absent: filteredRecords.filter((r) => r.status === "absent").length,
    late: filteredRecords.filter((r) => r.status === "late").length,
    halfDay: filteredRecords.filter((r) => r.status === "half-day").length,
    leave: filteredRecords.filter((r) => r.status === "leave").length,
    totalHours: filteredRecords.reduce((sum, r) => sum + r.totalHours, 0),
    totalOvertime: filteredRecords.reduce((sum, r) => sum + r.overtime, 0),
  };

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="font-bold text-2xl text-green-600">
              {totalStats.present}
            </div>
            <div className="text-gray-600 text-sm">Present</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="font-bold text-2xl text-red-600">
              {totalStats.absent}
            </div>
            <div className="text-gray-600 text-sm">Absent</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="font-bold text-2xl text-blue-600">
              {totalStats.totalHours.toFixed(1)}
            </div>
            <div className="text-gray-600 text-sm">Total Hours</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="font-bold text-2xl text-purple-600">
              {totalStats.totalOvertime.toFixed(1)}
            </div>
            <div className="text-gray-600 text-sm">Overtime</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-col gap-4 md:flex-row">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
                <Input
                  className="pl-10"
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by date, day, or location..."
                  value={searchTerm}
                />
              </div>
            </div>
            <Select onValueChange={setStatusFilter} value={statusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
                <SelectItem value="late">Late</SelectItem>
                <SelectItem value="half-day">Half Day</SelectItem>
                <SelectItem value="leave">Leave</SelectItem>
              </SelectContent>
            </Select>
            <Select onValueChange={setMonthFilter} value={monthFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                <SelectItem value="2024-01">January 2024</SelectItem>
                <SelectItem value="2023-12">December 2023</SelectItem>
                <SelectItem value="2023-11">November 2023</SelectItem>
              </SelectContent>
            </Select>
            <Button className="flex items-center gap-2" variant="outline">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>

          {/* History Table */}
          <div className="rounded-md border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="p-4 text-left font-medium">Date</th>
                    <th className="p-4 text-left font-medium">Day</th>
                    <th className="p-4 text-left font-medium">Check In</th>
                    <th className="p-4 text-left font-medium">Check Out</th>
                    <th className="p-4 text-left font-medium">Status</th>
                    <th className="p-4 text-left font-medium">Hours</th>
                    <th className="p-4 text-left font-medium">Overtime</th>
                    <th className="p-4 text-left font-medium">Location</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((record) => (
                    <tr className="border-b hover:bg-gray-50" key={record.id}>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {record.date}
                        </div>
                      </td>
                      <td className="p-4">{record.day}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          {record.checkIn}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          {record.checkOut}
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant={getStatusVariant(record.status)}>
                          {record.status.charAt(0).toUpperCase() +
                            record.status.slice(1).replace("-", " ")}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <span className={getStatusColor(record.status)}>
                          {record.totalHours.toFixed(1)}h
                        </span>
                      </td>
                      <td className="p-4">
                        {record.overtime > 0 ? (
                          <span className="text-purple-600">
                            +{record.overtime.toFixed(1)}h
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="p-4 text-gray-600 text-sm">
                        {record.location || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredRecords.length === 0 && (
              <div className="py-8 text-center text-gray-500">
                No attendance records found matching your filters
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
