import { adminAttendanceRouter } from "./attendance";
import { adminDashboardRouter } from "./dashboard";
import { adminMemberRouter } from "./member";
import { adminTeamRouter } from "./team";

export const adminRouter = {
  team: adminTeamRouter,
  member: adminMemberRouter,
  dashboard: adminDashboardRouter,
  attendance: adminAttendanceRouter,
};
