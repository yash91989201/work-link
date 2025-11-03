import { Building2, Plus, Users, X } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface CreateTeamDialogProps {
  children: React.ReactNode;
}

export const CreateTeamDialog = ({ children }: CreateTeamDialogProps) => {
  const [open, setOpen] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [description, setDescription] = useState("");
  const [teamLead, setTeamLead] = useState("");
  const [members, setMembers] = useState<string[]>([]);

  // Mock team members data
  const mockMembers = [
    { id: "1", name: "Sarah Johnson", email: "sarah@example.com", avatar: "" },
    { id: "2", name: "Mike Chen", email: "mike@example.com", avatar: "" },
    { id: "3", name: "Emily Davis", email: "emily@example.com", avatar: "" },
    { id: "4", name: "John Smith", email: "john@example.com", avatar: "" },
    { id: "5", name: "Lisa Anderson", email: "lisa@example.com", avatar: "" },
  ];

  const handleAddMember = (memberId: string) => {
    if (!members.includes(memberId)) {
      setMembers([...members, memberId]);
    }
  };

  const handleRemoveMember = (memberId: string) => {
    setMembers(members.filter((id) => id !== memberId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Creating team:", {
      teamName,
      description,
      teamLead,
      members,
    });
    // Reset form
    setTeamName("");
    setDescription("");
    setTeamLead("");
    setMembers([]);
    setOpen(false);
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Create New Team
          </DialogTitle>
          <DialogDescription>
            Create a new team and invite members to collaborate.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="teamName">Team Name *</Label>
              <Input
                id="teamName"
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Enter team name"
                required
                value={teamName}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the team's purpose and responsibilities"
                rows={3}
                value={description}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="teamLead">Team Lead</Label>
              <Select onValueChange={setTeamLead} value={teamLead}>
                <SelectTrigger>
                  <SelectValue placeholder="Select team lead (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {mockMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback>
                            {member.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        {member.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Team Members */}
          <div className="space-y-4">
            <Label>Team Members</Label>

            {/* Selected Members */}
            {members.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {members.map((memberId) => {
                  const member = mockMembers.find((m) => m.id === memberId);
                  if (!member) return null;
                  return (
                    <Badge
                      className="flex items-center gap-1"
                      key={memberId}
                      variant="secondary"
                    >
                      <Users className="h-3 w-3" />
                      {member.name}
                      <button
                        className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
                        onClick={() => handleRemoveMember(memberId)}
                        type="button"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  );
                })}
              </div>
            )}

            {/* Add Members */}
            <div className="space-y-2">
              <Label className="text-muted-foreground text-sm">
                Add team members
              </Label>
              <div className="max-h-32 space-y-1 overflow-y-auto rounded-lg border p-2">
                {mockMembers
                  .filter((member) => !members.includes(member.id))
                  .map((member) => (
                    <button
                      className="flex w-full items-center gap-2 rounded-lg p-2 transition-colors hover:bg-muted"
                      key={member.id}
                      onClick={() => handleAddMember(member.id)}
                      type="button"
                    >
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="text-left">
                        <p className="font-medium text-sm">{member.name}</p>
                        <p className="text-muted-foreground text-xs">
                          {member.email}
                        </p>
                      </div>
                      <Plus className="ml-auto h-4 w-4 text-muted-foreground" />
                    </button>
                  ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => setOpen(false)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button disabled={!teamName.trim()} type="submit">
              Create Team
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
