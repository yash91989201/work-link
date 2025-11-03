import { Search } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { MemberTable } from "./member-table";

export const MemberManagement = () => (
  <div className="space-y-4">
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Member Management</CardTitle>
            <CardDescription>
              Manage organization members and their roles
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <InputGroup className="mb-3">
          <InputGroupInput placeholder="Search..." />
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
        </InputGroup>

        {/* <MemberTable /> */}
      </CardContent>
    </Card>
  </div>
);
