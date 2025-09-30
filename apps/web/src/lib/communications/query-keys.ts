export const communicationsKeys = {
  channels: {
    list: (filters?: {
      type?: "team" | "direct" | "announcement" | "project";
      teamId?: string;
      includeArchived?: boolean;
      limit?: number;
      offset?: number;
    }) => ["communications", "channels", "list", filters ?? null] as const,
    detail: (channelId: string) => ["communications", "channels", "detail", channelId] as const,
    members: (channelId: string) => ["communications", "channels", "members", channelId] as const,
  },
  messages: {
    list: (
      channelId: string,
      params?: {
        beforeMessageId?: string;
        afterMessageId?: string;
        limit?: number;
        offset?: number;
      }
    ) => ["communications", "messages", "list", channelId, params ?? null] as const,
    detail: (messageId: string) => ["communications", "messages", "detail", messageId] as const,
    thread: (parentMessageId: string) => [
      "communications",
      "messages",
      "thread",
      parentMessageId,
    ] as const,
    search: (
      channelId: string,
      query: string,
      params?: {
        limit?: number;
        offset?: number;
      }
    ) => [
      "communications",
      "messages",
      "search",
      channelId,
      query,
      params ?? null,
    ] as const,
  },
};

export type CommunicationsQueryKey = ReturnType<
  (typeof communicationsKeys)[keyof typeof communicationsKeys][keyof (typeof communicationsKeys)[keyof typeof communicationsKeys]]
>;
