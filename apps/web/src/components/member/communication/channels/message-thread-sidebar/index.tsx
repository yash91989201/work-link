import { Spool, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MaximizedMessageComposer } from "@/components/member/communication/channels/message-composer/maximized-message-composer";
import { cn } from "@/lib/utils";
import type { MessageWithParent } from "@/stores/message-list-store";
import {
  useMessageList,
  useMessageListActions,
} from "@/stores/message-list-store";
import { formatMessageDate } from "@/utils/message-utils";
import { MessageComposer } from "../message-composer";
import { HelpText } from "../message-composer/help-text";
import { MessageItem } from "../message-list/message-item";

export function MessageThreadSidebar({ channelId }: { channelId: string }) {
  const {
    isThreadSidebarOpen,
    threadMessages,
    threadParentMessage,
    threadOriginMessageId,
    threadComposerFocusKey,
    shouldFocusThreadComposer,
  } = useMessageList(channelId);

  const { acknowledgeThreadComposerFocus, closeThread } =
    useMessageListActions();

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showMaximizedComposer, setShowMaximizedComposer] = useState(false);
  const [threadComposerText, setThreadComposerText] = useState("");

  useEffect(() => {
    if (shouldFocusThreadComposer) {
      acknowledgeThreadComposerFocus();
    }
  }, [shouldFocusThreadComposer, acknowledgeThreadComposerFocus]);

  useEffect(() => {
    if (isThreadSidebarOpen && !threadParentMessage) {
      closeThread();
    }
  }, [isThreadSidebarOpen, threadParentMessage, closeThread]);

  useEffect(() => {
    if (!isThreadSidebarOpen) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    container.scrollTop = container.scrollHeight;
  }, [isThreadSidebarOpen]);

  useEffect(() => {
    if (!(isThreadSidebarOpen && threadOriginMessageId)) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    const target = container.querySelector<HTMLElement>(
      `[data-message-id="${threadOriginMessageId}"]`
    );

    target?.scrollIntoView({ block: "center" });
  }, [threadOriginMessageId, isThreadSidebarOpen]);

  const replies = useMemo(
    () =>
      threadParentMessage
        ? threadMessages.filter(
            (message) => message.parentMessageId === threadParentMessage.id
          )
        : [],
    [threadMessages, threadParentMessage]
  );

  const hasParentMessage = threadParentMessage !== null;
  const repliesCount = replies.length;

  const shouldRenderContent = isThreadSidebarOpen || hasParentMessage;

  const handleMaximizedReply = useCallback(() => {
    setShowMaximizedComposer(true);
  }, []);

  const handleMaximizedSubmit = useCallback((content: string) => {
    setThreadComposerText(content);
    setShowMaximizedComposer(false);
  }, []);

  return (
    <div
      aria-hidden={!isThreadSidebarOpen}
      className={cn(
        "flex h-full min-w-0 shrink-0 flex-col overflow-hidden bg-background/95 backdrop-blur-sm transition-[width,opacity] duration-300 ease-in-out supports-backdrop-filter:bg-background/60",
        isThreadSidebarOpen
          ? "w-full max-w-full border-l opacity-100 shadow-lg sm:w-[640px]"
          : "w-0 max-w-0 opacity-0"
      )}
      data-testid="message-thread-sidebar"
    >
      {shouldRenderContent && (
        <div className="flex h-full flex-1 flex-col">
          <div className="flex items-start justify-between border-b bg-muted/30 px-4 py-3">
            <div className="flex gap-3 space-y-1.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
                <Spool className="h-5 w-5 text-primary" />
              </div>
              {hasParentMessage ? (
                <div className="flex flex-col gap-1.5">
                  <div className="font-semibold text-base">
                    {threadParentMessage?.sender.name}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    {threadParentMessage?.createdAt
                      ? formatMessageDate(threadParentMessage.createdAt)
                      : null}
                  </div>
                  <div className="font-medium text-primary text-xs">
                    {repliesCount === 0
                      ? "No replies yet"
                      : `${repliesCount} repl${
                          repliesCount === 1 ? "y" : "ies"
                        }`}
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Select a message to view its thread.
                </p>
              )}
            </div>
            <button
              aria-label="Close thread"
              className="rounded-lg p-1.5 opacity-70 ring-offset-background transition-all hover:bg-destructive/10 hover:text-destructive hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
              onClick={closeThread}
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div
            className="flex-1 space-y-3 overflow-y-auto px-1.5 py-3"
            ref={scrollContainerRef}
          >
            {hasParentMessage ? (
              <>
                <ThreadMessageItem message={threadParentMessage} />
                {replies.length === 0 ? (
                  <div className="mx-2 mt-2 rounded-lg border bg-muted/40 p-3 text-muted-foreground text-sm">
                    Start the conversation by replying to this message.
                  </div>
                ) : (
                  replies.map((reply) => (
                    <ThreadMessageItem key={reply.id} message={reply} />
                  ))
                )}
              </>
            ) : (
              <div className="flex h-full items-center justify-center px-4 text-center text-muted-foreground text-sm">
                Select a message to open its thread.
              </div>
            )}
          </div>

          {hasParentMessage ? (
            <div className="border-t">
              <MessageComposer
                channelId={channelId}
                initialContent={threadComposerText}
                key={`${threadParentMessage.id}-${threadComposerFocusKey}`}
                onMaximize={handleMaximizedReply}
                parentMessageId={threadParentMessage.id}
                placeholder="Reply in thread..."
                showHelpText={false}
              />
              <HelpText />
            </div>
          ) : (
            <div className="border-t px-4 py-3 text-center text-muted-foreground text-xs">
              Select a message to reply in a thread.
            </div>
          )}

          <MaximizedMessageComposer
            channelId={channelId}
            mode="create"
            onOpenChange={setShowMaximizedComposer}
            onSendSuccess={handleMaximizedSubmit}
            open={showMaximizedComposer}
            parentMessageId={threadParentMessage?.id}
            placeholder="Reply in thread..."
          />
        </div>
      )}
    </div>
  );
}

function ThreadMessageItem({ message }: { message: MessageWithParent }) {
  return (
    <MessageItem
      message={message}
      showParentPreview={false}
      showThreadSummary={false}
    />
  );
}
