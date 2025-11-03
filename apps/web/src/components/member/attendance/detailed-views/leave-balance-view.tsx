import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface LeaveType {
  id: string;
  name: string;
  total: number;
  used: number;
  pending: number;
  balance: number;
  color: string;
}

interface LeaveRequest {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: "approved" | "pending" | "rejected";
  appliedOn: string;
  approver?: string;
}

export function LeaveBalanceView() {
  const [showLeaveRequest, setShowLeaveRequest] = useState(false);

  const leaveTypes: LeaveType[] = [
    {
      id: "1",
      name: "Annual Leave",
      total: 21,
      used: 5,
      pending: 2,
      balance: 14,
      color: "blue",
    },
    {
      id: "2",
      name: "Sick Leave",
      total: 12,
      used: 3,
      pending: 0,
      balance: 9,
      color: "green",
    },
    {
      id: "3",
      name: "Personal Leave",
      total: 7,
      used: 1,
      pending: 1,
      balance: 5,
      color: "purple",
    },
    {
      id: "4",
      name: "Maternity/Paternity",
      total: 90,
      used: 0,
      pending: 0,
      balance: 90,
      color: "pink",
    },
  ];

  const leaveRequests: LeaveRequest[] = [
    {
      id: "1",
      type: "Annual Leave",
      startDate: "2024-01-25",
      endDate: "2024-01-26",
      days: 2,
      reason: "Family vacation",
      status: "approved",
      appliedOn: "2024-01-15",
      approver: "John Doe",
    },
    {
      id: "2",
      type: "Sick Leave",
      startDate: "2024-01-12",
      endDate: "2024-01-12",
      days: 1,
      reason: "Medical appointment",
      status: "approved",
      appliedOn: "2024-01-11",
      approver: "Jane Smith",
    },
    {
      id: "3",
      type: "Personal Leave",
      startDate: "2024-02-05",
      endDate: "2024-02-06",
      days: 2,
      reason: "Personal work",
      status: "pending",
      appliedOn: "2024-01-28",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="mr-1 h-3 w-3" />
            Approved
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="secondary">
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive">
            <AlertCircle className="mr-1 h-3 w-3" />
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const totalLeaves = {
    total: leaveTypes.reduce((sum, type) => sum + type.total, 0),
    used: leaveTypes.reduce((sum, type) => sum + type.used, 0),
    pending: leaveTypes.reduce((sum, type) => sum + type.pending, 0),
    balance: leaveTypes.reduce((sum, type) => sum + type.balance, 0),
  };

  return (
    <div className="space-y-6">
      {/* Leave Balance Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Leave Balance Overview</CardTitle>
            <Dialog onOpenChange={setShowLeaveRequest} open={showLeaveRequest}>
              <DialogTrigger asChild>
                <Button>Request Leave</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Request Leave</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right" htmlFor="leave-type">
                      Leave Type
                    </Label>
                    <Select>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select leave type" />
                      </SelectTrigger>
                      <SelectContent>
                        {leaveTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name} ({type.balance} days available)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right" htmlFor="start-date">
                      Start Date
                    </Label>
                    <Input className="col-span-3" id="start-date" type="date" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right" htmlFor="end-date">
                      End Date
                    </Label>
                    <Input className="col-span-3" id="end-date" type="date" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right" htmlFor="reason">
                      Reason
                    </Label>
                    <Textarea
                      className="col-span-3"
                      id="reason"
                      placeholder="Enter reason for leave"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      onClick={() => setShowLeaveRequest(false)}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                    <Button onClick={() => setShowLeaveRequest(false)}>
                      Submit Request
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="font-bold text-2xl text-blue-600">
                {totalLeaves.total}
              </div>
              <div className="text-gray-600 text-sm">Total Leave Days</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-2xl text-green-600">
                {totalLeaves.used}
              </div>
              <div className="text-gray-600 text-sm">Used</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-2xl text-yellow-600">
                {totalLeaves.pending}
              </div>
              <div className="text-gray-600 text-sm">Pending</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-2xl text-purple-600">
                {totalLeaves.balance}
              </div>
              <div className="text-gray-600 text-sm">Available</div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {leaveTypes.map((leaveType) => (
              <div className="rounded-lg border p-4" key={leaveType.id}>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-medium">{leaveType.name}</h3>
                  <span
                    className={`font-medium text-sm text-${leaveType.color}-600`}
                  >
                    {leaveType.balance}/{leaveType.total} days
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Used: {leaveType.used} days</span>
                    <span>Pending: {leaveType.pending} days</span>
                  </div>
                  <Progress
                    className="h-2"
                    value={(leaveType.used / leaveType.total) * 100}
                  />
                  <div className="text-gray-500 text-xs">
                    {((leaveType.balance / leaveType.total) * 100).toFixed(1)}%
                    available
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Leave Requests History */}
      <Card>
        <CardHeader>
          <CardTitle>Leave Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {leaveRequests.map((request) => (
              <div className="rounded-lg border p-4" key={request.id}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <h3 className="font-medium">{request.type}</h3>
                      {getStatusBadge(request.status)}
                    </div>
                    <div className="mb-2 flex items-center gap-4 text-gray-600 text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {request.startDate} → {request.endDate}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {request.days} days
                      </div>
                    </div>
                    <p className="mb-2 text-gray-600 text-sm">
                      {request.reason}
                    </p>
                    <div className="flex items-center gap-4 text-gray-500 text-xs">
                      <span>Applied: {request.appliedOn}</span>
                      {request.approver && (
                        <span>Approved by: {request.approver}</span>
                      )}
                    </div>
                  </div>
                  {request.status === "pending" && (
                    <Button size="sm" variant="outline">
                      Withdraw
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {leaveRequests.length === 0 && (
              <div className="py-8 text-center text-gray-500">
                <FileText className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                <p>No leave requests found</p>
                <Button
                  className="mt-4"
                  onClick={() => setShowLeaveRequest(true)}
                >
                  Request Leave
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Leave Policy */}
      <Card>
        <CardHeader>
          <CardTitle>Leave Policy Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <h4 className="mb-2 font-medium">Leave Accrual</h4>
              <ul className="space-y-1 text-gray-600 text-sm">
                <li>• Annual Leave: 1.75 days per month</li>
                <li>• Sick Leave: 1 day per month</li>
                <li>• Personal Leave: 0.58 days per month</li>
                <li>• Maximum carry-over: 10 days (Annual Leave)</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-2 font-medium">Leave Rules</h4>
              <ul className="space-y-1 text-gray-600 text-sm">
                <li>• Minimum 3 days notice for planned leave</li>
                <li>• Medical certificate required for &gt;3 sick days</li>
                <li>• Leave requests require manager approval</li>
                <li>• Emergency leave available for urgent situations</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

