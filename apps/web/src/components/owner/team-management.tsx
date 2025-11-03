import { Filter, Search } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CreateTeamForm } from "../admin/team/create-team-form";
import { TeamList } from "./team-list";

export const TeamManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Team Management</CardTitle>
              <CardDescription>
                Create and manage organization teams
              </CardDescription>
            </div>
            <CreateTeamForm />
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-8"
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search teams..."
                value={searchQuery}
              />
            </div>
            <Button size="icon" variant="outline">
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          <TeamList />
        </CardContent>
      </Card>
    </div>
  );
};
