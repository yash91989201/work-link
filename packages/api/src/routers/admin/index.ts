import { adminMemberRouter } from "./member";
import { adminTeamRouter } from "./team";

export const adminRouter = {
  team: adminTeamRouter,
  member: adminMemberRouter,
};
