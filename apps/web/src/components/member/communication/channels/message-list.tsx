import type { MessageType } from "@server/lib/types";
import { format, formatDistanceToNow } from "date-fns";
import {
  Check,
  ChevronDown,
  ChevronRight,
  CornerUpLeft,
  Edit3,
  MessageCircle,
  Pin,
  Reply,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { MentionSuggestions } from "@/components/shared/mention-suggestions";
import { EnhancedMessageContent } from "@/components/shared/message-content";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useMessages } from "@/hooks/communications";
import { useChannelMembers } from "@/hooks/communications/use-channel-members";
import { useMentionUsers } from "@/hooks/communications/use-mention-users";
import { useAuthedSession } from "@/hooks/use-authed-session";
import type { Mention } from "@/lib/mentions";
import {
  extractMentionUserIds,
  getCurrentWord,
  getMentionQuery,
  insertMention,
} from "@/lib/mentions";
import { cn } from "@/lib/utils";

interface MessageListProps {
  channelId: string;
  className?: string;
}

const EmptyState = () => (
  <div className="flex h-full items-center justify-center p-8">
    <div className="max-w-sm space-y-6 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5">
        <MessageCircle className="h-10 w-10 text-primary/60" />
      </div>
      <div className="space-y-3">
        <h3 className="font-semibold text-foreground text-lg">
          Welcome to the channel!
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          This is the beginning of your conversation. Start by sending a message
          to break the ice. 🎉
        </p>
      </div>
      <div className="space-y-2">
        <p className="font-medium text-muted-foreground text-xs">Tips:</p>
        <ul className="space-y-1 text-muted-foreground text-xs">
          <li>• Be respectful and professional</li>
          <li>• Use @ to mention team members</li>
          <li>• Share files with the attachment button</li>
        </ul>
      </div>
    </div>
  </div>
);

const MessageSkeleton = () => (
  <div className="flex gap-3 px-4 py-3">
    <Skeleton className="h-10 w-10 flex-shrink-0 rounded-full" />
    <div className="flex-1 space-y-2">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
      <Skeleton className="h-4 w-full max-w-md" />
      <Skeleton className="h-4 w-3/4 max-w-sm" />
    </div>
  </div>
);

const LoadingSkeleton = () => (
  <div className="space-y-1 py-4">
    {Array.from({ length: 8 }).map((_, index) => (
      <MessageSkeleton key={index.toString()} />
    ))}
  </div>
);

interface MessageItemProps {
  message: MessageType & {
    sender: { name: string; email: string; image: string | null };
    parentMessage?: MessageType & {
      sender: { name: string; email: string; image: string | null };
    };
  };
  channelId: string;
  onDelete: (messageId: string) => Promise<void>;
  onEdit: (
    messageId: string,
    content: string,
    mentions?: string[]
  ) => Promise<void>;
  onReply: (
    content: string,
    parentMessageId: string,
    mentions?: string[]
  ) => Promise<void>;
  onPin: (messageId: string) => void;
  isDeleting?: boolean;
  isUpdating?: boolean;
}

const MessageItem = ({
  message,
  channelId,
  onDelete,
  onEdit,
  onReply,
  onPin,
  isDeleting,
  isUpdating,
}: MessageItemProps) => {
  const { user } = useAuthedSession();
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [editContent, setEditContent] = useState(message.content || "");
  const [replyContent, setReplyContent] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const replyTextareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const replyContainerRef = useRef<HTMLDivElement>(null);

  const { data: channelMembersData } = useChannelMembers(channelId);
  const { data: mentionUsersData, isFetching: isFetchingUsers } =
    useMentionUsers(channelId, mentionQuery, showMentionSuggestions);

  // Handle mention detection and suggestions for edit mode
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const content = e.target.value;
    const position = e.target.selectionStart;

    setEditContent(content);
    setCursorPosition(position);

    // Check if current word is a mention
    const currentWord = getCurrentWord(content, position);

    if (currentWord.startsWith("@")) {
      const query = getMentionQuery(currentWord);
      if (query.length >= 0) {
        // Allow empty query to show all users
        setMentionQuery(query);
        setShowMentionSuggestions(true);
        setSelectedMentionIndex(0); // Reset selection when showing suggestions
      } else {
        setShowMentionSuggestions(false);
        setMentionQuery("");
      }
    } else {
      setShowMentionSuggestions(false);
      setMentionQuery("");
    }
  };

  // Handle mention detection and suggestions for reply mode
  const handleReplyTextareaChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const content = e.target.value;
    const position = e.target.selectionStart;

    setReplyContent(content);
    setCursorPosition(position);

    // Check if current word is a mention
    const currentWord = getCurrentWord(content, position);

    if (currentWord.startsWith("@")) {
      const query = getMentionQuery(currentWord);
      if (query.length >= 0) {
        // Allow empty query to show all users
        setMentionQuery(query);
        setShowMentionSuggestions(true);
        setSelectedMentionIndex(0); // Reset selection when showing suggestions
      } else {
        setShowMentionSuggestions(false);
        setMentionQuery("");
      }
    } else {
      setShowMentionSuggestions(false);
      setMentionQuery("");
    }
  };

  // Handle mention selection for edit mode
  const handleMentionSelect = (mention: Mention) => {
    const result = insertMention(editContent, cursorPosition, mention);
    setEditContent(result.content);
    setShowMentionSuggestions(false);
    setMentionQuery("");
    setSelectedMentionIndex(0); // Reset selection

    // Focus back to textarea and set cursor position
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(
          result.newCursorPosition,
          result.newCursorPosition
        );
      }
    }, 0);
  };

  // Handle mention selection for reply mode
  const handleReplyMentionSelect = (mention: Mention) => {
    const result = insertMention(replyContent, cursorPosition, mention);
    setReplyContent(result.content);
    setShowMentionSuggestions(false);
    setMentionQuery("");
    setSelectedMentionIndex(0); // Reset selection

    // Focus back to textarea and set cursor position
    setTimeout(() => {
      if (replyTextareaRef.current) {
        replyTextareaRef.current.focus();
        replyTextareaRef.current.setSelectionRange(
          result.newCursorPosition,
          result.newCursorPosition
        );
      }
    }, 0);
  };

  // Handle keyboard navigation for mentions
  const handleMentionKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (!(showMentionSuggestions && mentionUsersData?.users)) return;

    const users = mentionUsersData.users;
    const maxIndex = Math.max(0, users.length - 1);

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setSelectedMentionIndex((prev) => (prev + 1 > maxIndex ? 0 : prev + 1));
        break;
      case "ArrowUp":
        event.preventDefault();
        setSelectedMentionIndex((prev) => (prev - 1 < 0 ? maxIndex : prev - 1));
        break;
      case "Enter":
        event.preventDefault();
        if (users.length > 0 && selectedMentionIndex < users.length) {
          handleMentionSelect(users[selectedMentionIndex]);
        }
        break;
      case "Escape":
        event.preventDefault();
        setShowMentionSuggestions(false);
        setMentionQuery("");
        setSelectedMentionIndex(0);
        break;
      default:
        break;
    }
  };

  // Hide mention suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        replyContainerRef.current &&
        !replyContainerRef.current.contains(event.target as Node)
      ) {
        setShowMentionSuggestions(false);
        setMentionQuery("");
        setSelectedMentionIndex(0);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (mentionUsersData !== undefined && mentionUsersData.users.length > 0) {
      setSelectedMentionIndex(0);
    }
  }, [mentionUsersData]);

  const timestamp = format(message.createdAt, "MMM d, HH:mm");
  const relativeTime = formatDistanceToNow(message.createdAt, {
    addSuffix: true,
  });
  const initials = (message.sender.name ?? "?").slice(0, 2).toUpperCase();
  const canEdit = user?.id === message.senderId;

  const handleSaveEdit = async () => {
    const trimmedContent = editContent.trim();
    if (!trimmedContent || trimmedContent === message.content) {
      setIsEditing(false);
      setEditContent(message.content || "");
      return;
    }

    try {
      // Extract mentions using the available channel members data
      let mentions: string[] = [];

      // Convert channel members to Mention format
      const channelMentions: Mention[] = (
        channelMembersData?.members || []
      ).map((member) => ({
        id: member.id,
        name: member.name,
        email: member.email,
        image: member.image,
      }));

      mentions = extractMentionUserIds(trimmedContent, channelMentions);

      await onEdit(
        message.id,
        trimmedContent,
        mentions.length > 0 ? mentions : undefined
      );
      setIsEditing(false);
      toast("Message updated successfully");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update message";
      toast(errorMessage);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(message.content || "");
  };

  const handleSaveReply = async () => {
    const trimmedContent = replyContent.trim();
    if (!trimmedContent) {
      return;
    }

    try {
      // Extract mentions using the available channel members data
      let mentions: string[] = [];

      // Convert channel members to Mention format
      const channelMentions: Mention[] = (
        channelMembersData?.members || []
      ).map((member) => ({
        id: member.id,
        name: member.name,
        email: member.email,
        image: member.image,
      }));

      mentions = extractMentionUserIds(trimmedContent, channelMentions);

      await onReply(
        trimmedContent,
        message.id,
        mentions.length > 0 ? mentions : undefined
      );
      setIsReplying(false);
      setReplyContent("");
      toast("Reply sent successfully");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to send reply";
      toast(errorMessage);
    }
  };

  const handleCancelReply = () => {
    setIsReplying(false);
    setReplyContent("");
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // First handle mention-specific keys
    handleMentionKeyDown(event);

    // Then handle normal keys if not prevented
    if (!event.defaultPrevented && event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSaveEdit();
    } else if (!event.defaultPrevented && event.key === "Escape") {
      handleCancelEdit();
    }
  };

  const handleReplyKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    // First handle mention-specific keys
    handleMentionKeyDown(event);

    // Then handle normal keys if not prevented
    if (!event.defaultPrevented && event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSaveReply();
    } else if (!event.defaultPrevented && event.key === "Escape") {
      handleCancelReply();
    }
  };

  return (
    <div
      className={cn(
        "group flex gap-3 rounded-lg border bg-card/50 px-4 py-3 transition-colors hover:bg-card",
        isDeleting && "pointer-events-none opacity-50",
        canEdit && "border-l-2 border-l-primary/50"
      )}
    >
      <Avatar className="h-10 w-10 flex-shrink-0">
        <AvatarImage
          alt={message.sender.name ?? "User"}
          src={message.sender.image ?? undefined}
        />
        <AvatarFallback className="bg-primary/10 font-medium text-primary text-sm">
          {initials}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        {/* Parent message preview */}
        {message.parentMessage && (
          <div className="group relative mb-3">
            <div className="absolute top-0 bottom-0 left-0 w-0.5 bg-primary/30" />
            <div className="ml-3 rounded-l-lg border border-border/50 border-l-primary/50 bg-gradient-to-r from-primary/5 to-muted/20 p-3 shadow-sm">
              <div className="mb-2 flex items-center gap-2">
                <CornerUpLeft className="h-3 w-3 text-primary/60" />
                <span className="font-medium text-primary/80 text-xs uppercase tracking-wide">
                  Replying to{" "}
                  {message.parentMessage.sender?.name ?? "Unknown User"}
                </span>
                <span className="text-muted-foreground text-xs">
                  •{" "}
                  {formatDistanceToNow(message.parentMessage.createdAt, {
                    addSuffix: true,
                  })}
                </span>
              </div>
              <div className="rounded border-l-2 border-l-primary/30 pl-2">
                <div className="line-clamp-3 text-muted-foreground text-sm leading-relaxed">
                  {message.parentMessage.content}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mb-2 flex items-baseline gap-3">
          <span className="font-semibold text-foreground text-sm">
            {message.sender.name ?? "Unknown User"}
          </span>
          <span className="text-muted-foreground text-xs" title={timestamp}>
            {relativeTime}
          </span>
          {message.parentMessageId && (
            <Badge className="px-1.5 py-0.5 text-xs" variant="secondary">
              <CornerUpLeft className="mr-1 h-2.5 w-2.5" />
              Reply
            </Badge>
          )}
          {message.createdAt > new Date(Date.now() - 1000 * 60 * 5) && (
            <Badge className="px-1 py-0 text-xs" variant="secondary">
              New
            </Badge>
          )}
          {message.isEdited && (
            <Badge className="px-1 py-0 text-xs" variant="outline">
              edited
            </Badge>
          )}
        </div>
        {isEditing ? (
          <div className="relative space-y-2" ref={containerRef}>
            <Textarea
              autoFocus
              className="min-h-[80px] resize-none rounded-lg border bg-background/80 shadow-sm"
              disabled={isUpdating}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="Edit message... (@ to mention)"
              ref={textareaRef}
              value={editContent}
            />
            {/* Mention suggestions */}
            {showMentionSuggestions && (
              <>
                {console.log(
                  "Edit mode - Rendering MentionSuggestions, users:",
                  mentionUsersData?.users?.length,
                  "isLoading:",
                  isFetchingUsers
                )}
                <MentionSuggestions
                  isLoading={isFetchingUsers}
                  isVisible={showMentionSuggestions}
                  onSelect={handleMentionSelect}
                  query={mentionQuery}
                  users={mentionUsersData?.users || []}
                />
              </>
            )}
            <div className="flex items-center justify-between">
              <div className="text-muted-foreground text-xs">
                Press Enter to save, Escape to cancel, Shift+Enter for new line
              </div>
              <div className="flex items-center gap-2">
                <Button
                  className="h-7 px-2 text-xs"
                  disabled={isUpdating}
                  onClick={handleCancelEdit}
                  size="sm"
                  variant="ghost"
                >
                  <X className="mr-1 h-3 w-3" />
                  Cancel
                </Button>
                <Button
                  className="h-7 px-2 text-xs"
                  disabled={isUpdating || !editContent.trim()}
                  onClick={handleSaveEdit}
                  size="sm"
                >
                  {isUpdating ? (
                    <div className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
                  ) : (
                    <Check className="mr-1 h-3 w-3" />
                  )}
                  Save
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {message.content && <EnhancedMessageContent message={message} />}

            {/* Reply form */}
            {isReplying && (
              <div className="relative mt-3 space-y-2" ref={replyContainerRef}>
                <div className="group relative rounded-lg border border-border/50 bg-gradient-to-r from-primary/5 to-muted/20 p-3 shadow-sm">
                  <div className="absolute top-0 bottom-0 left-0 w-0.5 bg-primary/30" />
                  <div className="ml-3">
                    <div className="mb-2 flex items-center gap-2">
                      <CornerUpLeft className="h-3 w-3 text-primary/60" />
                      <span className="font-medium text-primary/80 text-xs uppercase tracking-wide">
                        Replying to {message.sender.name ?? "Unknown User"}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        • {relativeTime}
                      </span>
                    </div>
                    <div className="rounded border-l-2 border-l-primary/30 pl-2">
                      <div className="line-clamp-2 text-muted-foreground text-sm leading-relaxed">
                        {message.content}
                      </div>
                    </div>
                  </div>
                </div>
                <Textarea
                  autoFocus
                  className="min-h-[80px] resize-none rounded-lg border bg-background/80 shadow-sm"
                  disabled={isUpdating}
                  onChange={handleReplyTextareaChange}
                  onKeyDown={handleReplyKeyDown}
                  placeholder="Write a reply... (@ to mention)"
                  ref={replyTextareaRef}
                  value={replyContent}
                />
                {/* Mention suggestions */}
                {showMentionSuggestions && (
                  <MentionSuggestions
                    isLoading={isFetchingUsers}
                    isVisible={showMentionSuggestions}
                    onSelect={handleReplyMentionSelect}
                    query={mentionQuery}
                    users={mentionUsersData?.users || []}
                  />
                )}
                <div className="flex items-center justify-between">
                  <div className="text-muted-foreground text-xs">
                    Press Enter to send, Escape to cancel, Shift+Enter for new
                    line
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      className="h-7 px-2 text-xs"
                      disabled={isUpdating}
                      onClick={handleCancelReply}
                      size="sm"
                      variant="ghost"
                    >
                      <X className="mr-1 h-3 w-3" />
                      Cancel
                    </Button>
                    <Button
                      className="h-7 px-2 text-xs"
                      disabled={isUpdating || !replyContent.trim()}
                      onClick={handleSaveReply}
                      size="sm"
                    >
                      {isUpdating ? (
                        <div className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
                      ) : (
                        <Send className="mr-1 h-3 w-3" />
                      )}
                      Send
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        {!(isEditing || isReplying) && (
          <div className="mt-2 flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className="h-7 px-2 text-xs"
                  onClick={() => setIsReplying(true)}
                  size="sm"
                  variant="ghost"
                >
                  <Reply className="mr-1 h-3 w-3" />
                  Reply
                </Button>
              </TooltipTrigger>
              <TooltipContent sideOffset={6}>Reply to message</TooltipContent>
            </Tooltip>
            {canEdit && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className="h-7 px-2 text-xs"
                    onClick={() => setIsEditing(true)}
                    size="sm"
                    variant="ghost"
                  >
                    <Edit3 className="mr-1 h-3 w-3" />
                    Edit
                  </Button>
                </TooltipTrigger>
                <TooltipContent sideOffset={6}>
                  Edit your message
                </TooltipContent>
              </Tooltip>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className="h-7 px-2 text-xs"
                  onClick={() => onPin(message.id)}
                  size="sm"
                  variant="ghost"
                >
                  <Pin className="mr-1 h-3 w-3" />
                  Pin
                </Button>
              </TooltipTrigger>
              <TooltipContent sideOffset={6}>Pin this message</TooltipContent>
            </Tooltip>
          </div>
        )}
      </div>

      <div className="flex items-start opacity-0 transition-opacity group-hover:opacity-100">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              aria-label="Delete message"
              className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              disabled={isDeleting}
              onClick={() => onDelete(message.id)}
              size="icon"
              variant="ghost"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent sideOffset={6}>Delete</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};

interface MessageContentProps {
  messages: (MessageType & {
    sender: { name: string; email: string; image: string | null };
    parentMessage?: MessageType & {
      sender: { name: string; email: string; image: string | null };
    };
  })[];
  channelId: string;
  onDelete: (messageId: string) => Promise<void>;
  onEdit: (
    messageId: string,
    content: string,
    mentions?: string[]
  ) => Promise<void>;
  onReply: (
    content: string,
    parentMessageId: string,
    mentions?: string[]
  ) => Promise<void>;
  onPin: (messageId: string) => Promise<void>;
  deletingMessageId?: string;
  updatingMessageId?: string;
}

const MessageContent = ({
  messages,
  channelId,
  onDelete,
  onEdit,
  onReply,
  onPin,
  deletingMessageId,
  updatingMessageId,
}: MessageContentProps) => {
  type Msg = MessageContentProps["messages"][number];
  type ThreadNode = { message: Msg; children: ThreadNode[] };

  const nodesById = new Map<string, ThreadNode>();
  const roots: ThreadNode[] = [];

  // Initialize nodes
  for (const m of messages) {
    nodesById.set(m.id, { message: m, children: [] });
  }

  // Link children to parents to build the tree
  for (const node of nodesById.values()) {
    const parentId = node.message.parentMessageId as string | undefined;
    if (parentId && nodesById.has(parentId)) {
      nodesById.get(parentId)?.children.push(node);
    } else {
      roots.push(node);
    }
  }

  // Sort messages chronologically at each level
  const sortNodes = (arr: ThreadNode[]) => {
    arr.sort(
      (a, b) => a.message.createdAt.getTime() - b.message.createdAt.getTime()
    );
    for (const n of arr) {
      sortNodes(n.children);
    }
  };
  sortNodes(roots);

  // UI helpers
  const levelClasses = (level: number) => {
    if (level <= 0) {
      return "";
    }
    if (level === 1) {
      return "ml-4 border-l-2 border-primary/30 bg-muted/20 rounded-lg pl-3 py-1";
    }
    if (level === 2) {
      return "ml-8 border-l-2 border-primary/20 bg-muted/30 rounded-lg pl-3 py-1";
    }
    return "ml-12 border-l-2 border-primary/10 bg-muted/40 rounded-lg pl-3 py-1";
  };

  const countDescendants = (node: ThreadNode): number =>
    node.children.reduce((acc, child) => acc + 1 + countDescendants(child), 0);

  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());
  const toggleCollapse = (id: string) =>
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const renderNode = (node: ThreadNode, level: number) => {
    const isCollapsed = collapsedIds.has(node.message.id);
    const hasChildren = node.children.length > 0;
    const replyCount = hasChildren ? countDescendants(node) : 0;

    return (
      <div className={cn(levelClasses(level))} key={node.message.id}>
        <div className="relative">
          {/* vertical thread rail accent */}
          {level > 0 && (
            <div className="-left-[11px] pointer-events-none absolute top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/40 via-border to-transparent" />
          )}
          <MessageItem
            channelId={channelId}
            isDeleting={deletingMessageId === node.message.id}
            isUpdating={updatingMessageId === node.message.id}
            message={node.message}
            onDelete={onDelete}
            onEdit={onEdit}
            onPin={onPin}
            onReply={onReply}
          />
        </div>

        {hasChildren && (
          <div className="mt-1 flex items-center gap-2 pl-1">
            <Button
              className="h-7 px-2 text-muted-foreground hover:text-foreground"
              onClick={() => toggleCollapse(node.message.id)}
              size="sm"
              variant="ghost"
            >
              {isCollapsed ? (
                <ChevronRight className="mr-1 h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="mr-1 h-3.5 w-3.5" />
              )}
              <span className="text-xs">
                {isCollapsed ? "View" : "Hide"} {replyCount} repl
                {replyCount === 1 ? "y" : "ies"}
              </span>
            </Button>
            {!isCollapsed && <div className="h-px flex-1 bg-border/50" />}
          </div>
        )}

        {hasChildren && !isCollapsed && (
          <div className="mt-2 space-y-2">
            {node.children.map((child) => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return <div className="space-y-3">{roots.map((n) => renderNode(n, 0))}</div>;
};

interface MessageListContentProps {
  isLoading: boolean;
  hasMessages: boolean;
  messages: (MessageType & {
    sender: { name: string; email: string; image: string | null };
    parentMessage?: MessageType & {
      sender: { name: string; email: string; image: string | null };
    };
  })[];
  channelId: string;
  onDelete: (messageId: string) => Promise<void>;
  onEdit: (
    messageId: string,
    content: string,
    mentions?: string[]
  ) => Promise<void>;
  onReply: (
    content: string,
    parentMessageId: string,
    mentions?: string[]
  ) => Promise<void>;
  onPin: (messageId: string) => Promise<void>;
  deletingMessageId?: string;
  updatingMessageId?: string;
}

const MessageListContent = ({
  isLoading,
  hasMessages,
  messages,
  channelId,
  onDelete,
  onEdit,
  onReply,
  deletingMessageId,
  updatingMessageId,
  onPin,
}: MessageListContentProps) => {
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!hasMessages) {
    return <EmptyState />;
  }

  return (
    <MessageContent
      channelId={channelId}
      deletingMessageId={deletingMessageId}
      messages={messages}
      onDelete={onDelete}
      onEdit={onEdit}
      onPin={onPin}
      onReply={onReply}
      updatingMessageId={updatingMessageId}
    />
  );
};

export const MessageList = ({ channelId, className }: MessageListProps) => {
  const {
    messages,
    isFetchingChannelMessage,
    deletingMessageId,
    updatingMessageId,
    createMessage,
    deleteMessage,
    updateMessage,
    messagesEndRef,
    pinMessage,
  } = useMessages(channelId);

  const handleDelete = async (messageId: string) => {
    try {
      await deleteMessage({ messageId });
      toast("Message deleted successfully");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete message";
      toast(message);
    }
  };

  const handleReply = async (
    content: string,
    parentMessageId: string,
    mentions?: string[]
  ) => {
    try {
      await createMessage({
        channelId,
        content,
        parentMessageId,
        mentions,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to send reply";
      toast(message);
      throw error;
    }
  };

  const handleEdit = async (
    messageId: string,
    content: string,
    mentions?: string[]
  ) => {
    try {
      await updateMessage({ messageId, content, mentions });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update message";
      toast(message);
      throw error;
    }
  };

  const handlePin = async (messageId: string) => {
    try {
      await pinMessage({ messageId });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to pin message";
      toast(message);
      throw error;
    }
  };

  const orderedMessages = [...messages].sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
  );

  const hasMessages = orderedMessages.length > 0;

  return (
    <div className={cn("flex-1 overflow-hidden bg-background", className)}>
      <ScrollArea className="h-full">
        <div className="flex flex-col pt-3 sm:px-4">
          <MessageListContent
            channelId={channelId}
            deletingMessageId={deletingMessageId}
            hasMessages={hasMessages}
            isLoading={isFetchingChannelMessage}
            messages={orderedMessages}
            onDelete={handleDelete}
            onEdit={handleEdit}
            onPin={handlePin}
            onReply={handleReply}
            updatingMessageId={updatingMessageId}
          />
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
    </div>
  );
};
