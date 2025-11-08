import { Suspense } from "react";
import { TeamList } from "../owner";
import { TeamListSkeleton } from "../owner/team-list";
import { CreateTeamForm } from "./team/create-team-form";

export const AdminTeamsManagement = () => {
  return (
    <div className="flex h-full flex-col gap-3">
      {/* Header */}
      <div className="border-b py-4">
        <div className="flex items-center justify-between">
          <h1 className="mt-2 font-bold text-2xl">Teams Management</h1>
          <div className="flex items-center gap-2">
            <CreateTeamForm />
          </div>
        </div>
      </div>

      <Suspense fallback={<TeamListSkeleton />}>
        <TeamList />
      </Suspense>
    </div>
  );
};
