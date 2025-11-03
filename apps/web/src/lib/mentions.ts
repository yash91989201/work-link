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

export const parseMentions = (content: string): MentionMatch[] => {
  const mentionRegex = /@([^\s@]+(?:\s+[^\s@]+)*)/g;
  const mentions: MentionMatch[] = [];
  let match = mentionRegex.exec(content);
  while (match !== null) {
    mentions.push({
      id: "", // Will be filled by looking up the user
      name: match[1], // Display name from content
      email: "",
      image: null,
      start: match.index,
      end: match.index + match[0].length,
    });
    match = mentionRegex.exec(content);
  }
  return mentions;
};

// Extract user IDs from content by looking up actual users
// Extract user IDs from content - matches @display_name and maps to user IDs
export const extractMentionUserIds = (
  content: string,
  users: Mention[]
): string[] => {
  // Regex to match @display_name format (including multi-word names)
  const mentionRegex = /@([^\s@]+(?:\s+[^\s@]+)*)/g;
  const userIds: string[] = [];
  const matches = content.matchAll(mentionRegex);

  for (const match of matches) {
    const displayName = match[1].toLowerCase();
    // Find user by display name (case-insensitive)
    const user = users.find((u) => u.name?.toLowerCase() === displayName);
    if (user) {
      userIds.push(user.id);
    }
  }
  return [...new Set(userIds)]; // Remove duplicates
};

// Replace mentions with formatted HTML/spans - keeps @display_name but adds user ID data
export const formatMentions = (
  content: string,
  mentions: Mention[]
): string => {
  let formattedContent = content;

  for (const mention of mentions) {
    // Replace @display_name with formatted span containing user ID
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
  while (
    start > 0 &&
    content[start - 1] !== " " &&
    content[start - 1] !== "\n"
  ) {
    start--;
  }

  // Find the end of the current word
  let end = cursorPosition;
  while (
    end < content.length &&
    content[end] !== " " &&
    content[end] !== "\n"
  ) {
    end++;
  }

  return content.substring(start, end);
};

// Check if current word is a mention trigger
export const isMentionTrigger = (word: string): boolean => word.startsWith("@");

// Extract mention query from current word
export const getMentionQuery = (word: string): string => {
  if (!isMentionTrigger(word)) {
    return "";
  }
  return word.slice(1); // Remove the @ symbol
};

// Insert mention at cursor position - shows name but stores ID info separately
export const insertMention = (
  content: string,
  cursorPosition: number,
  mention: Mention
): { content: string; newCursorPosition: number } => {
  // Find the start and end of the current word (mention being replaced)
  let start = cursorPosition;
  while (
    start > 0 &&
    content[start - 1] !== " " &&
    content[start - 1] !== "\n"
  ) {
    start--;
  }

  let end = cursorPosition;
  while (
    end < content.length &&
    content[end] !== " " &&
    content[end] !== "\n"
  ) {
    end++;
  }

  // Replace the mention word with @display_name
  const beforeMention = content.substring(0, start);
  const afterMention = content.substring(end);
  const mentionText = `@${mention.name}`; // Show name in UI

  const newContent = beforeMention + mentionText + afterMention;
  const newCursorPosition = start + mentionText.length;

  return {
    content: newContent,
    newCursorPosition,
  };
};
