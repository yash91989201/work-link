import { memberAttendanceRouter } from "./attendance";
import { memberChannelRouter } from "./channel";

export const memberRouter = {
  attendance: memberAttendanceRouter,
  channel: memberChannelRouter,
};
