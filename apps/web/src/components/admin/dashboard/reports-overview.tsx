import {
  BarChart3,
  Calendar,
  Clock,
  Download,
  Edit,
  Eye,
  FileText,
  Filter,
  MoreHorizontal,
  RefreshCw,
  Search,
  Share,
  Trash2,
  TrendingUp,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Mock data for reports
const reportsData = {
  availableReports: [
    {
      id: "1",
      name: "Monthly Team Performance",
      description: "Comprehensive analysis of team performance metrics",
      type: "performance",
      category: "teams",
      lastGenerated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      size: "2.4 MB",
      format: "PDF",
      frequency: "Monthly",
      status: "completed",
    },
    {
      id: "2",
      name: "Member Engagement Report",
      description: "Detailed member activity and engagement metrics",
      type: "engagement",
      category: "members",
      lastGenerated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      size: "1.8 MB",
      format: "PDF",
      frequency: "Weekly",
      status: "completed",
    },
    {
      id: "3",
      name: "Growth Analytics",
      description: "Organization growth and retention metrics",
      type: "growth",
      category: "analytics",
      lastGenerated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      size: "3.1 MB",
      format: "Excel",
      frequency: "Monthly",
      status: "completed",
    },
    {
      id: "4",
      name: "Attendance Summary",
      description: "Member attendance and participation summary",
      type: "attendance",
      category: "operations",
      lastGenerated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      size: "856 KB",
      format: "PDF",
      frequency: "Daily",
      status: "completed",
    },
    {
      id: "5",
      name: "Custom Report Template",
      description: "Customizable report template for specific metrics",
      type: "custom",
      category: "custom",
      lastGenerated: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      size: "124 KB",
      format: "Template",
      frequency: "On-demand",
      status: "draft",
    },
  ],
  scheduledReports: [
    {
      id: "1",
      name: "Weekly Dashboard Summary",
      schedule: "Every Monday, 9:00 AM",
      recipients: 12,
      nextRun: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      active: true,
    },
    {
      id: "2",
      name: "Monthly Performance Review",
      schedule: "1st of month, 8:00 AM",
      recipients: 5,
      nextRun: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      active: true,
    },
    {
      id: "3",
      name: "Quarterly Analytics Report",
      schedule: "Quarterly, 10:00 AM",
      recipients: 8,
      nextRun: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      active: false,
    },
  ],
  recentExports: [
    {
      id: "1",
      reportName: "Team Performance Q3",
      exportedBy: "Admin User",
      exportedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      format: "PDF",
      status: "completed",
      downloadUrl: "#",
    },
    {
      id: "2",
      reportName: "Member List",
      exportedBy: "Sarah Johnson",
      exportedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      format: "CSV",
      status: "completed",
      downloadUrl: "#",
    },
    {
      id: "3",
      reportName: "Attendance Report",
      exportedBy: "Mike Chen",
      exportedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      format: "Excel",
      status: "processing",
      downloadUrl: null,
    },
  ],
};

// Report Type Badge
const ReportTypeBadge = ({ type }: { type: string }) => {
  const variants = {
    performance: "default",
    engagement: "secondary",
    growth: "outline",
    attendance: "secondary",
    custom: "outline",
  } as const;

  return (
    <Badge variant={variants[type as keyof typeof variants]}>{type}</Badge>
  );
};

// Status Badge
const StatusBadge = ({ status }: { status: string }) => {
  const variants = {
    completed: "default",
    draft: "secondary",
    processing: "outline",
    failed: "destructive",
  } as const;

  return (
    <Badge variant={variants[status as keyof typeof variants]}>{status}</Badge>
  );
};

// Export Status Badge
const ExportStatusBadge = ({ status }: { status: string }) => {
  const variants = {
    completed: "default",
    processing: "outline",
    failed: "destructive",
  } as const;

  const getIcon = () => {
    switch (status) {
      case "completed":
        return <FileText className="h-3 w-3" />;
      case "processing":
        return <Clock className="h-3 w-3" />;
      case "failed":
        return <FileText className="h-3 w-3" />;
      default:
        return null;
    }
  };

  return (
    <Badge
      className="flex items-center gap-1"
      variant={variants[status as keyof typeof variants]}
    >
      {getIcon()}
      {status}
    </Badge>
  );
};

// Report Card Component
const ReportCard = ({ report }: { report: any }) => {
  const getIcon = () => {
    switch (report.type) {
      case "performance":
        return <BarChart3 className="h-4 w-4 text-blue-600" />;
      case "engagement":
        return <Users className="h-4 w-4 text-green-600" />;
      case "growth":
        return <TrendingUp className="h-4 w-4 text-purple-600" />;
      case "attendance":
        return <Calendar className="h-4 w-4 text-orange-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {getIcon()}
            <CardTitle className="text-sm">{report.name}</CardTitle>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Eye className="mr-2 h-3 w-3" />
                Preview
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="mr-2 h-3 w-3" />
                Download
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="mr-2 h-3 w-3" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="mr-2 h-3 w-3" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardDescription className="text-xs">
          {report.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <ReportTypeBadge type={report.type} />
          <StatusBadge status={report.status} />
        </div>

        <div className="grid grid-cols-2 gap-2 text-muted-foreground text-xs">
          <div>
            <span className="font-medium">Format:</span> {report.format}
          </div>
          <div>
            <span className="font-medium">Size:</span> {report.size}
          </div>
          <div>
            <span className="font-medium">Frequency:</span> {report.frequency}
          </div>
          <div>
            <span className="font-medium">Last:</span>{" "}
            {report.lastGenerated.toLocaleDateString()}
          </div>
        </div>

        <div className="flex gap-2">
          <Button className="flex-1" size="sm">
            <Download className="mr-1 h-3 w-3" />
            Download
          </Button>
          <Button size="sm" variant="outline">
            <Share className="mr-1 h-3 w-3" />
            Share
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export const ReportsOverview = () => {
  const [reportType, setReportType] = useState("all");
  const [timeRange, setTimeRange] = useState("all");

  return (
    <div className="space-y-6">
      {/* Filters and Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Select onValueChange={setReportType} value={reportType}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Report Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Reports</SelectItem>
              <SelectItem value="performance">Performance</SelectItem>
              <SelectItem value="engagement">Engagement</SelectItem>
              <SelectItem value="growth">Growth</SelectItem>
              <SelectItem value="attendance">Attendance</SelectItem>
            </SelectContent>
          </Select>

          <Select onValueChange={setTimeRange} value={timeRange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline">
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
          <Button size="sm" variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button size="sm" variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button>
            <FileText className="mr-2 h-4 w-4" />
            Create Report
          </Button>
        </div>
      </div>

      {/* Available Reports Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reportsData.availableReports.map((report) => (
          <ReportCard key={report.id} report={report} />
        ))}
      </div>

      {/* Scheduled Reports and Recent Exports */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Scheduled Reports */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Scheduled Reports</CardTitle>
                <CardDescription>Automated report generation</CardDescription>
              </div>
              <Button size="sm" variant="outline">
                <Clock className="mr-2 h-4 w-4" />
                Schedule New
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportsData.scheduledReports.map((scheduled) => (
                <div
                  className="flex items-center justify-between rounded-lg border p-3"
                  key={scheduled.id}
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{scheduled.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {scheduled.schedule}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Next run: {scheduled.nextRun.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={scheduled.active ? "default" : "secondary"}>
                      {scheduled.active ? "Active" : "Paused"}
                    </Badge>
                    <Button size="sm" variant="ghost">
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Exports */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Exports</CardTitle>
            <CardDescription>Latest exported reports</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report</TableHead>
                  <TableHead>By</TableHead>
                  <TableHead>Format</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportsData.recentExports.map((exportItem) => (
                  <TableRow key={exportItem.id}>
                    <TableCell className="font-medium text-sm">
                      {exportItem.reportName}
                    </TableCell>
                    <TableCell className="text-sm">
                      {exportItem.exportedBy}
                    </TableCell>
                    <TableCell>
                      <Badge className="text-xs" variant="outline">
                        {exportItem.format}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <ExportStatusBadge status={exportItem.status} />
                    </TableCell>
                    <TableCell>
                      {exportItem.status === "completed" &&
                      exportItem.downloadUrl ? (
                        <Button size="sm" variant="ghost">
                          <Download className="h-3 w-3" />
                        </Button>
                      ) : (
                        <Button disabled size="sm" variant="ghost">
                          <Clock className="h-3 w-3" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
