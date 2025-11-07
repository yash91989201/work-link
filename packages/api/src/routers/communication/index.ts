import { channelRouter } from "@/routers/communication/channel";
import { messageRouter } from "@/routers/communication/message";

export const communicationRouter = {
  channel: channelRouter,
  message: messageRouter,
};
