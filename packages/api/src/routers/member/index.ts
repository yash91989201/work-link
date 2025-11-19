import { memberAttendanceRouter } from "./attendance";
import { memberChannelRouter } from "./channel";
import { presenceRouter } from "./presence";
import { workBlockRouter } from "./work-block";

export const memberRouter = {
  attendance: memberAttendanceRouter,
  channel: memberChannelRouter,
  workBlock: workBlockRouter,
  presence: presenceRouter,
};
