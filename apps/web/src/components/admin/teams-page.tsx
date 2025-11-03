import { AdminRootLayout } from "@/components/admin/layout";
import { AdminTeamsManagement } from "@/components/admin/teams-management";

const TeamsPage = () => {
  return (
    <AdminRootLayout>
      <AdminTeamsManagement />
    </AdminRootLayout>
  );
};

export default TeamsPage;