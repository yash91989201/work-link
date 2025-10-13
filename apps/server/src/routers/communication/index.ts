import { channelRouter } from "@/routers/communication/channel";
import { messagesRouter } from "@/routers/communication/messages";

export const communicationRouter = {
  channel: channelRouter,
  messages: messagesRouter,
};
