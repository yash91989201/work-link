import { channelRouter } from "@/routers/communication/channel";
import { messageRouter } from "@/routers/communication/messages";

export const communicationRouter = {
  channel: channelRouter,
  message: messageRouter,
};
