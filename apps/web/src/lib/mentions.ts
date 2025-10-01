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
  const words = content.split(WHITESPACE_REGEX);
  let currentPosition = 0;

  for (const word of words) {
    const wordStart = currentPosition;
    const wordEnd = currentPosition + word.length;

    if (cursorPosition >= wordStart && cursorPosition <= wordEnd) {
      return word;
    }

    currentPosition = wordEnd + 1; // +1 for the space
  }

  return "";
};

// Check if current word is a mention trigger
export const isMentionTrigger = (word: string): boolean => {
  return word.startsWith("@") && word.length > 1;
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
  const words = content.split(WHITESPACE_REGEX);
  let currentPosition = 0;
  let mentionWordIndex = -1;
  let mentionWordStart = 0;
  let mentionWordEnd = 0;

  // Find the word at cursor position
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const wordStart = currentPosition;
    const wordEnd = currentPosition + word.length;

    if (cursorPosition >= wordStart && cursorPosition <= wordEnd) {
      mentionWordIndex = i;
      mentionWordStart = wordStart;
      mentionWordEnd = wordEnd;
      break;
    }

    currentPosition = wordEnd + 1; // +1 for the space
  }

  if (mentionWordIndex === -1) {
    // No word at cursor position, just append
    const newContent = `${content}${content ? " " : ""}@${mention.name}`;
    return {
      content: newContent,
      newCursorPosition: newContent.length,
    };
  }

  // Replace the mention word
  const beforeMention = content.substring(0, mentionWordStart);
  const afterMention = content.substring(mentionWordEnd);
  const mentionText = `@${mention.name}`;

  const newContent = beforeMention + mentionText + afterMention;
  const newCursorPosition = mentionWordStart + mentionText.length;

  return {
    content: newContent,
    newCursorPosition,
  };
};

