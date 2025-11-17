import { useParams } from "@tanstack/react-router";
import { Spool, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { MessageComposer } from "@/components/member/communication/channels/message-composer";
import { HelpText } from "@/components/member/communication/channels/message-composer/help-text";
import { MessageItem } from "@/components/member/communication/channels/message-list/message-item";
import { Button } from "@/components/ui/button";
import { useMessageThread } from "@/hooks/communications/use-message-thread";
import {
  useMaximizedMessageComposerActions,
  useMessageThreadSidebar,
} from "@/stores/channel-store";
import { formatMessageDate } from "@/utils/message-utils";

export function MessageThreadSidebar() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);
  const previousScrollHeight = useRef(0);
  const [threadComposerText, setThreadComposerText] = useState("");

  const { id: channelId } = useParams({
    from: "/(authenticated)/org/$slug/(member)/(base-modules)/communication/channels/$id",
  });

  const { messageId, isOpen, closeMessageThread } = useMessageThreadSidebar();

  const { message, threadMessages, messagesEndRef, hasMore, loadMore } =
    useMessageThread({
      messageId,
    });

  const repliesCount = threadMessages.length;

  useEffect(() => {
    if (messageId === undefined) {
      closeMessageThread();
    }
  }, [messageId, closeMessageThread]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Need to track message count changes
  useEffect(() => {
    if (isOpen) {
      isInitialMount.current = true;
      previousScrollHeight.current = 0;
    }
  }, [isOpen, messageId]);

  useEffect(() => {
    if (isInitialMount.current && threadMessages.length > 0) {
      const container = scrollContainerRef.current;
      if (container) {
        setTimeout(() => {
          container.scrollTop = container.scrollHeight;
          isInitialMount.current = false;
        }, 100);
      }
    }
  }, [threadMessages.length]);

  useEffect(() => {
    if (isInitialMount.current) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop } = container;

      if (scrollTop < 100 && hasMore) {
        previousScrollHeight.current = container.scrollHeight;
        loadMore();
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [hasMore, loadMore]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Need to track message count changes
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || isInitialMount.current) return;

    const currentScrollHeight = container.scrollHeight;
    const heightDifference = currentScrollHeight - previousScrollHeight.current;

    if (heightDifference > 0) {
      container.scrollTop += heightDifference;
      previousScrollHeight.current = currentScrollHeight;
    }
  }, [threadMessages.length]);

  useEffect(() => {
    if (!(isOpen && messageId)) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    const target = container.querySelector<HTMLElement>(
      `[data-message-id="${messageId}"]`
    );

    target?.scrollIntoView({ block: "center" });
  }, [messageId, isOpen]);

  const { openMaximizedMessageComposer } = useMaximizedMessageComposerActions();

  const handleMaximizedReply = useCallback(
    (content: string) => {
      if (!message) return;

      setThreadComposerText(content);
      openMaximizedMessageComposer({
        content,
        parentMessageId: message.id,
        onComplete: (result) => {
          if (result.action === "cancel") {
            setThreadComposerText(result.content ?? content);
            return;
          }
          setThreadComposerText("");
        },
      });
    },
    [message, openMaximizedMessageComposer]
  );

  if (!isOpen) {
    return (
      <div
        aria-hidden
        className="w-0 max-w-0 opacity-0"
        data-testid="message-thread-sidebar"
      />
    );
  }

  if (message === undefined) {
    return (
      <div
        className="flex h-full w-full max-w-full border-l opacity-100 shadow-lg sm:w-[640px]"
        data-testid="message-thread-sidebar"
      >
        <div className="flex h-full flex-1 flex-col items-center justify-center gap-3 px-4 text-center text-muted-foreground text-sm">
          <p>Message might be deleted</p>
          <Button className="rounded-full" onClick={closeMessageThread}>
            Close thread
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex h-full w-full min-w-0 max-w-full shrink-0 flex-col overflow-hidden border-l bg-background/95 opacity-100 shadow-lg backdrop-blur-sm transition-[width,opacity] duration-300 ease-in-out supports-backdrop-filter:bg-background/60 sm:w-[640px]"
      data-testid="message-thread-sidebar"
    >
      <div className="flex h-full flex-1 flex-col">
        <div className="flex items-start justify-between border-b bg-muted/30 px-4 py-3">
          <div className="flex gap-3 space-y-1.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
              <Spool className="h-5 w-5 text-primary" />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="font-semibold text-base">
                {message.sender.name}
              </div>
              <div className="text-muted-foreground text-xs">
                {formatMessageDate(message.createdAt)}
              </div>
              <div className="font-medium text-primary text-xs">
                {repliesCount === 0
                  ? "No replies yet"
                  : `${repliesCount} repl${repliesCount === 1 ? "y" : "ies"}`}
              </div>
            </div>
          </div>
          <button
            aria-label="Close thread"
            className="rounded-lg p-1.5 opacity-70 ring-offset-background transition-all hover:bg-destructive/10 hover:text-destructive hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
            onClick={closeMessageThread}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div
          className="flex-1 space-y-3 overflow-y-auto p-3"
          ref={scrollContainerRef}
        >
          {hasMore && (
            <div className="flex justify-center py-2">
              <div className="text-muted-foreground text-sm">
                Loading older replies...
              </div>
            </div>
          )}
          {threadMessages.length === 0 ? (
            <div className="mx-2 mt-2 rounded-lg border bg-muted/40 p-3 text-muted-foreground text-sm">
              Start the conversation by replying to this message.
            </div>
          ) : (
            threadMessages.map((reply) => (
              <MessageItem
                isThreadMessage={true}
                key={reply.id}
                message={reply}
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t">
          <MessageComposer
            channelId={channelId}
            initialContent={threadComposerText}
            key={`${message.id}-${Date.now()}`}
            onMaximize={handleMaximizedReply}
            parentMessageId={message.id}
            placeholder="Reply in thread..."
            showHelpText={false}
          />
          <HelpText />
        </div>
      </div>
    </div>
  );
}
