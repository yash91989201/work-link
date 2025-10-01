const WHITESPACE_REGEX = /\s+/;
// Types for mentions
export interface Mention {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
}

export interface MentionMatch {
  id: string;
  name: string;
  email: string;
  image: string | null;
  start: number;
  end: number;
}

// Parse mentions from message content
export const parseMentions = (content: string): MentionMatch[] => {
  const mentionRegex = /@(\w+(?:\s+\w+)*)/g;
  const mentions: MentionMatch[] = [];
  let match;

  while ((match = mentionRegex.exec(content)) !== null) {
    // For now, we'll create a placeholder match
    // The actual user lookup will happen on the server
    mentions.push({
      id: "", // Will be filled by the server
      name: match[1],
      email: "",
      image: null,
      start: match.index,
      end: match.index + match[0].length,
    });
  }

  return mentions;
};

// Extract user IDs from content by looking up actual users
export const extractMentionUserIds = (
  content: string,
  users: Mention[]
): string[] => {
  const mentionRegex = /@(\w+(?:\s+\w+)*)/g;
  const userIds: string[] = [];
  let match;

  while ((match = mentionRegex.exec(content)) !== null) {
    const mentionName = match[1].toLowerCase();

    // Find user by name or email
    const user = users.find(
      (u) =>
        u.name?.toLowerCase() === mentionName ||
        u.email.toLowerCase() === mentionName
    );

    if (user) {
      userIds.push(user.id);
    }
  }

  return [...new Set(userIds)]; // Remove duplicates
};

// Replace mentions with formatted HTML/spans
export const formatMentions = (
  content: string,
  mentions: Mention[]
): string => {
  let formattedContent = content;

  for (const mention of mentions) {
    const mentionPattern = new RegExp(
      `@${mention.name?.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`,
      "g"
    );
    formattedContent = formattedContent.replace(
      mentionPattern,
      `<span class="mention" data-user-id="${mention.id}" data-user-name="${mention.name}">@${mention.name}</span>`
    );
  }

  return formattedContent;
};

// Get current word at cursor position for mention detection
export const getCurrentWord = (
  content: string,
  cursorPosition: number
): string => {
  // Find the start of the current word
  let start = cursorPosition;
  while (start > 0 && content[start - 1] !== ' ' && content[start - 1] !== '\n') {
    start--;
  }

  // Find the end of the current word
  let end = cursorPosition;
  while (end < content.length && content[end] !== ' ' && content[end] !== '\n') {
    end++;
  }

  return content.substring(start, end);
};

// Check if current word is a mention trigger
export const isMentionTrigger = (word: string): boolean => {
  return word.startsWith("@");
};

// Extract mention query from current word
export const getMentionQuery = (word: string): string => {
  if (!isMentionTrigger(word)) {
    return "";
  }
  return word.slice(1); // Remove the @ symbol
};

// Insert mention at cursor position
export const insertMention = (
  content: string,
  cursorPosition: number,
  mention: Mention
): { content: string; newCursorPosition: number } => {
  // Find the start and end of the current word (mention being replaced)
  let start = cursorPosition;
  while (start > 0 && content[start - 1] !== ' ' && content[start - 1] !== '\n') {
    start--;
  }

  let end = cursorPosition;
  while (end < content.length && content[end] !== ' ' && content[end] !== '\n') {
    end++;
  }

  // Replace the mention word
  const beforeMention = content.substring(0, start);
  const afterMention = content.substring(end);
  const mentionText = `@${mention.name}`;

  const newContent = beforeMention + mentionText + afterMention;
  const newCursorPosition = start + mentionText.length;

  return {
    content: newContent,
    newCursorPosition,
  };
};

