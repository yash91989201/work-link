import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X, Plus, Users, Building2 } from "lucide-react";

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
    setMembers(members.filter(id => id !== memberId));
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="teamName">Team Name *</Label>
              <Input
                id="teamName"
                placeholder="Enter team name"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the team's purpose and responsibilities"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="teamLead">Team Lead</Label>
              <Select value={teamLead} onValueChange={setTeamLead}>
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
                  const member = mockMembers.find(m => m.id === memberId);
                  if (!member) return null;
                  return (
                    <Badge key={memberId} variant="secondary" className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {member.name}
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(memberId)}
                        className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
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
              <Label className="text-sm text-muted-foreground">
                Add team members
              </Label>
              <div className="max-h-32 overflow-y-auto border rounded-lg p-2 space-y-1">
                {mockMembers
                  .filter(member => !members.includes(member.id))
                  .map((member) => (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => handleAddMember(member.id)}
                      className="w-full flex items-center gap-2 p-2 hover:bg-muted rounded-lg transition-colors"
                    >
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>
                          {member.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-left">
                        <p className="text-sm font-medium">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.email}</p>
                      </div>
                      <Plus className="h-4 w-4 ml-auto text-muted-foreground" />
                    </button>
                  ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!teamName.trim()}>
              Create Team
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};