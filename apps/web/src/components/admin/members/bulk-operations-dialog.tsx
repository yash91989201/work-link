import {
  Calendar,
  Download,
  Loader2,
  Mail,
  MessageSquare,
  Shield,
  Users,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

interface BulkOperationsDialogProps {
  children: React.ReactNode;
  selectedMembers: Array<{
    id: string;
    name: string;
    email: string;
    avatar?: string;
    currentRole: string;
    team: string;
    status: string;
  }>;
  onOperationComplete?: (operation: string, affectedMembers: number) => void;
}

interface BulkOperationForm {
  operation: string;
  targetRole?: string;
  message?: string;
  scheduleDate?: string;
  teamId?: string;
  notifyMembers: boolean;
  reason?: string;
}

const bulkOperations = {
  "send-message": {
    title: "Send Message",
    description: "Send a message to selected members",
    icon: MessageSquare,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  "change-role": {
    title: "Change Role",
    description: "Update roles for selected members",
    icon: Shield,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  "add-to-team": {
    title: "Add to Team",
    description: "Add members to a specific team",
    icon: Users,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  deactivate: {
    title: "Deactivate Members",
    description: "Deactivate selected member accounts",
    icon: XCircle,
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
  "send-invitation": {
    title: "Send Invitations",
    description: "Send team invitations via email",
    icon: Mail,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
  },
  "schedule-event": {
    title: "Schedule Event",
    description: "Schedule a meeting or training session",
    icon: Calendar,
    color: "text-indigo-600",
    bgColor: "bg-indigo-100",
  },
};

export const BulkOperationsDialog = ({
  children,
  selectedMembers,
  onOperationComplete,
}: BulkOperationsDialogProps) => {
  const [open, setOpen] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");
  const [results, setResults] = useState<{
    success: number;
    failed: number;
    errors: string[];
  }>({
    success: 0,
    failed: 0,
    errors: [],
  });

  const { register, handleSubmit, reset, watch, setValue } =
    useForm<BulkOperationForm>({
      defaultValues: {
        operation: "",
        targetRole: "",
        message: "",
        scheduleDate: new Date().toISOString().split("T")[0],
        teamId: "",
        notifyMembers: true,
        reason: "",
      },
    });

  const watchedOperation = watch("operation");

  const handleOperation = async (data: BulkOperationForm) => {
    setIsSubmitting(true);
    setProgress(0);
    setResults({ success: 0, failed: 0, errors: [] });

    try {
      const totalMembers = selectedMembers.length;
      const membersPerBatch = Math.ceil(totalMembers / 10); // Process in batches

      for (let i = 0; i < totalMembers; i += membersPerBatch) {
        const batch = selectedMembers.slice(i, i + membersPerBatch);
        const batchNumber = Math.floor(i / membersPerBatch) + 1;
        const totalBatches = Math.ceil(totalMembers / membersPerBatch);

        setCurrentStep(
          `Processing batch ${batchNumber} of ${totalBatches} (${batch.length} members)`
        );

        // Simulate API call for each batch
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Simulate random success/failure for demo
        const batchSuccess = Math.floor(batch.length * 0.9); // 90% success rate
        const batchFailed = batch.length - batchSuccess;

        setResults((prev) => ({
          success: prev.success + batchSuccess,
          failed: prev.failed + batchFailed,
          errors:
            batchFailed > 0
              ? [
                  ...prev.errors,
                  `Failed to process ${batchFailed} members in batch ${batchNumber}`,
                ]
              : prev.errors,
        }));

        setProgress(((i + batch.length) / totalMembers) * 100);
      }

      setCurrentStep("Operation completed");

      if (results.failed === 0) {
        toast.success(
          `Successfully completed ${data.operation} for ${selectedMembers.length} members`
        );
      } else {
        toast.warning(
          `Operation completed with ${results.failed} errors. ${results.success} successful.`
        );
      }

      onOperationComplete?.(data.operation, results.success);

      setTimeout(() => {
        reset();
        setSelectedOperation("");
        setProgress(0);
        setCurrentStep("");
        setResults({ success: 0, failed: 0, errors: [] });
        setOpen(false);
      }, 2000);
    } catch (error) {
      toast.error("Operation failed. Please try again.");
      setCurrentStep("Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getOperationColor = (operation: string) => {
    const op = bulkOperations[operation as keyof typeof bulkOperations];
    return op?.color || "text-gray-600";
  };

  const getOperationBgColor = (operation: string) => {
    const op = bulkOperations[operation as keyof typeof bulkOperations];
    return op?.bgColor || "bg-gray-100";
  };

  const exportSelectedMembers = () => {
    const csv = [
      ["Name", "Email", "Role", "Team", "Status"],
      ...selectedMembers.map((member) => [
        member.name,
        member.email,
        member.currentRole,
        member.team,
        member.status,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `selected-members-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success("Member list exported successfully");
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Bulk Operations
          </DialogTitle>
          <DialogDescription>
            Perform actions on {selectedMembers.length} selected members
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Selected Members Summary */}
          <Card>
            <CardContent className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-medium">
                  Selected Members ({selectedMembers.length})
                </h3>
                <Button
                  onClick={exportSelectedMembers}
                  size="sm"
                  variant="outline"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export List
                </Button>
              </div>
              <div className="max-h-32 space-y-2 overflow-y-auto">
                {selectedMembers.slice(0, 10).map((member) => (
                  <div
                    className="flex items-center justify-between rounded bg-muted/50 p-2"
                    key={member.id}
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback className="text-xs">
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{member.name}</p>
                        <p className="text-muted-foreground text-xs">
                          {member.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="text-xs" variant="outline">
                        {member.team}
                      </Badge>
                      <Badge className="text-xs" variant="secondary">
                        {member.currentRole}
                      </Badge>
                    </div>
                  </div>
                ))}
                {selectedMembers.length > 10 && (
                  <p className="text-center text-muted-foreground text-sm">
                    ...and {selectedMembers.length - 10} more members
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {!isSubmitting && results.success === 0 && (
            <form
              className="space-y-6"
              onSubmit={handleSubmit(handleOperation)}
            >
              {/* Operation Selection */}
              <div className="space-y-4">
                <Label className="font-medium text-base">
                  Select Operation
                </Label>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                  {Object.entries(bulkOperations).map(
                    ([operation, definition]) => (
                      <div
                        className={`cursor-pointer rounded-lg border p-4 transition-colors ${
                          selectedOperation === operation
                            ? "border-primary bg-primary/5"
                            : "hover:bg-muted/50"
                        }`}
                        key={operation}
                        onClick={() => {
                          setSelectedOperation(operation);
                          setValue("operation", operation);
                        }}
                      >
                        <div className="flex flex-col items-center space-y-2 text-center">
                          <div
                            className={`rounded-full p-2 ${getOperationBgColor(operation)}`}
                          >
                            <definition.icon
                              className={`h-4 w-4 ${getOperationColor(operation)}`}
                            />
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">
                              {definition.title}
                            </h4>
                            <p className="text-muted-foreground text-xs">
                              {definition.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Operation-Specific Fields */}
              {watchedOperation && (
                <div className="space-y-4">
                  <Separator />
                  <h3 className="font-medium">Operation Details</h3>

                  {/* Role Change Fields */}
                  {watchedOperation === "change-role" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="targetRole">Target Role</Label>
                        <Select
                          onValueChange={(value) =>
                            setValue("targetRole", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Administrator</SelectItem>
                            <SelectItem value="manager">Manager</SelectItem>
                            <SelectItem value="team-lead">Team Lead</SelectItem>
                            <SelectItem value="member">Member</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reason">Reason for Change</Label>
                        <Textarea
                          id="reason"
                          placeholder="Explain why this role change is necessary..."
                          {...register("reason", {
                            required: "Reason is required",
                          })}
                          rows={3}
                        />
                      </div>
                    </>
                  )}

                  {/* Add to Team Fields */}
                  {watchedOperation === "add-to-team" && (
                    <div className="space-y-2">
                      <Label htmlFor="teamId">Target Team</Label>
                      <Select
                        onValueChange={(value) => setValue("teamId", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select team" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="engineering">
                            Engineering
                          </SelectItem>
                          <SelectItem value="design">Design</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
                          <SelectItem value="sales">Sales</SelectItem>
                          <SelectItem value="operations">Operations</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Send Message Fields */}
                  {watchedOperation === "send-message" && (
                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        placeholder="Enter your message to send to all selected members..."
                        {...register("message", {
                          required: "Message is required",
                        })}
                        rows={4}
                      />
                    </div>
                  )}

                  {/* Schedule Event Fields */}
                  {watchedOperation === "schedule-event" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="scheduleDate">Event Date</Label>
                        <Input
                          id="scheduleDate"
                          type="datetime-local"
                          {...register("scheduleDate", {
                            required: "Event date is required",
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="message">Event Details</Label>
                        <Textarea
                          id="message"
                          placeholder="Describe the event purpose, location, and agenda..."
                          {...register("message", {
                            required: "Event details are required",
                          })}
                          rows={3}
                        />
                      </div>
                    </>
                  )}

                  {/* Send Invitation Fields */}
                  {watchedOperation === "send-invitation" && (
                    <div className="space-y-2">
                      <Label htmlFor="message">Invitation Message</Label>
                      <Textarea
                        id="message"
                        placeholder="Personal message to include with the invitations..."
                        {...register("message")}
                        rows={3}
                      />
                    </div>
                  )}

                  {/* Common Fields */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="notifyMembers"
                      {...register("notifyMembers")}
                    />
                    <Label htmlFor="notifyMembers">
                      Send notification to members about this action
                    </Label>
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button
                  onClick={() => setOpen(false)}
                  type="button"
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  disabled={!watchedOperation || isSubmitting}
                  type="submit"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Execute ${selectedOperation ? bulkOperations[selectedOperation as keyof typeof bulkOperations]?.title : "Operation"}`
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}

          {/* Progress Display */}
          {isSubmitting && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">Progress</span>
                  <span className="text-muted-foreground text-sm">
                    {Math.round(progress)}%
                  </span>
                </div>
                <Progress className="h-2" value={progress} />
                <p className="text-muted-foreground text-sm">{currentStep}</p>
              </div>
            </div>
          )}

          {/* Results Display */}
          {results.success > 0 && (
            <div className="space-y-4">
              <Card
                className={
                  results.failed > 0 ? "border-orange-200" : "border-green-200"
                }
              >
                <CardContent className="p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <h4 className="font-medium">Operation Results</h4>
                    <Badge
                      variant={results.failed > 0 ? "secondary" : "default"}
                    >
                      {results.failed === 0 ? "Success" : "Partial Success"}
                    </Badge>
                  </div>
                  <div className="mb-3 grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="font-bold text-2xl text-green-600">
                        {results.success}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        Successful
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-2xl text-red-600">
                        {results.failed}
                      </p>
                      <p className="text-muted-foreground text-sm">Failed</p>
                    </div>
                  </div>
                  {results.errors.length > 0 && (
                    <div className="space-y-1">
                      <p className="font-medium text-orange-600 text-sm">
                        Errors:
                      </p>
                      {results.errors.map((error, index) => (
                        <p
                          className="text-orange-700 text-xs"
                          key={index.toString()}
                        >
                          • {error}
                        </p>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
