# Realtime Communications Implementation Guide

This document explains how to use the **Supabase realtime features** that have been implemented in your communications module.

## Overview

The implementation provides real-time updates for:
- **Messages**: Instant message delivery, updates, and deletions
- **Presence**: User online/offline status and current channel tracking
- **Notifications**: Real-time notification delivery

## Architecture

### Core Components

1. **Realtime Service** (`/src/lib/communications/realtime.ts`)
   - Manages Supabase realtime connections
   - Handles channel subscriptions and cleanup
   - Provides presence tracking and broadcast functionality

2. **Unified Realtime Hooks** (`/src/hooks/communications/use-*.ts`)
   - `useMessages`: Real-time message subscriptions and management
   - `usePresence`: Real-time presence tracking and user status
   - `useNotifications`: Real-time notification delivery and management
   - `useChannels`: Real-time channel updates and member management

3. **Features**
   - Built-in Supabase realtime subscriptions
   - Automatic fallback to polling when realtime fails
   - Connection status indicators
   - Optimistic updates with cache management
   - Toast notifications and sound alerts

## Key Features

### 1. Real-time Messages
- Instant message delivery without polling
- Automatic UI updates when messages are created, updated, or deleted
- Support for optimistic updates
- Fallback to polling if real-time connection fails

### 2. Real-time Presence
- Live user status indicators (online, offline, away, busy)
- Automatic presence tracking when users join/leave channels
- Browser visibility integration (away status when tab is hidden)
- Current channel tracking

### 3. Real-time Notifications
- Instant notification delivery
- Toast notifications for new messages
- Sound notifications (optional)
- Automatic badge updates

## Usage Examples

### Using Real-time Messages

```tsx
import { useMessages } from "@/hooks/communications";
import { Suspense } from "react";
import { RealtimeChatSkeleton } from "@/components/communications/RealtimeChat";

function ChatComponent({ channelId }: { channelId: string }) {
  const {
    messages,
    isLoading,
    realtimeConnected,
    createMessage,
    updateMessage,
    deleteMessage,
  } = useMessages(channelId, {
    enableRealtime: true, // Enable real-time updates
    limit: 50,
  });

  const handleSendMessage = async (content: string) => {
    await createMessage.mutateAsync({
      channelId,
      content,
      type: "text",
    });
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <h3>Messages</h3>
        {realtimeConnected ? (
          <span className="text-green-500">● Live</span>
        ) : (
          <span className="text-gray-400">● Offline</span>
        )}
      </div>
      
      {messages.map((message) => (
        <div key={message.id}>
          {message.content}
        </div>
      ))}
    </div>
  );
}

// Wrap with Suspense boundary for loading states
function ChatWrapper({ channelId }: { channelId: string }) {
  return (
    <Suspense fallback={<RealtimeChatSkeleton />}>
      <ChatComponent channelId={channelId} />
    </Suspense>
  );
}
```

### Using Real-time Presence

```tsx
import { usePresence } from "@/hooks/communications";

function MemberList({ channelId }: { channelId: string }) {
  const {
    presenceList,
    isLoading,
    realtimeConnected,
    updateStatus,
  } = usePresence(channelId, {
    enableRealtime: true,
  });

  const handleStatusChange = (status: string) => {
    updateStatus.mutate({ status });
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <h3>Online Members</h3>
        {realtimeConnected ? (
          <span className="text-green-500">● Live</span>
        ) : (
          <span className="text-gray-400">● Offline</span>
        )}
      </div>
      
      {presenceList.map((member) => (
        <div key={member.id} className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            member.status === 'online' ? 'bg-green-500' :
            member.status === 'away' ? 'bg-yellow-500' :
            member.status === 'busy' ? 'bg-red-500' : 'bg-gray-500'
          }`} />
          <span>{member.name}</span>
          <span className="text-sm text-gray-500">
            {member.customStatus || member.status}
          </span>
        </div>
      ))}
    </div>
  );
}
```

### Using Real-time Notifications

```tsx
import { useNotifications, useUnreadNotificationsCount } from "@/hooks/communications";
import { useAuthedSession } from "@/hooks/use-authed-session";

function NotificationCenter() {
  const { user } = useAuthedSession();
  
  const {
    notifications,
    isLoading,
    realtimeConnected,
  } = useNotifications(user?.id || "", {
    enableRealtime: true,
  });

  const {
    data: unreadCount,
  } = useUnreadNotificationsCount(user?.id || "", {
    enableRealtime: true,
  });

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <h3>Notifications</h3>
        {realtimeConnected ? (
          <span className="text-green-500">● Live</span>
        ) : (
          <span className="text-gray-400">● Offline</span>
        )}
        {unreadCount && unreadCount > 0 && (
          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
            {unreadCount}
          </span>
        )}
      </div>
      
      {notifications.map((notification) => (
        <div key={notification.id} className="border-b pb-2">
          <h4 className="font-medium">{notification.title}</h4>
          <p className="text-sm text-gray-600">{notification.message}</p>
          <span className="text-xs text-gray-400">
            {new Date(notification.createdAt).toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}
```

## Hook Options

### `useMessages` Options
```typescript
interface UseMessagesOptions {
  limit?: number;           // Default: 50
  offset?: number;          // Default: 0
  beforeMessageId?: string; // For pagination
  afterMessageId?: string;  // For pagination
  enableRealtime?: boolean; // Default: true
}
```

### `usePresence` Options
```typescript
interface UsePresenceOptions {
  enableRealtime?: boolean; // Default: true
}
```

### `useNotifications` Options
```typescript
interface UseNotificationsOptions {
  enableRealtime?: boolean; // Default: true
}
```

## Advanced Usage

### Manual Realtime Service Usage

For advanced use cases, you can use the realtime service directly:

```tsx
import { communicationsRealtimeService } from "@/lib/communications/realtime";

function AdvancedComponent() {
  useEffect(() => {
    // Subscribe to custom events
    const unsubscribe = communicationsRealtimeService.subscribeToChannelMessages(
      "channel-id",
      (payload) => {
        console.log("Real-time update:", payload);
      }
    );

    // Track custom presence
    const trackPresence = async () => {
      await communicationsRealtimeService.trackUserPresence(
        "user-id",
        "channel-id",
        "online",
        "Working on something important"
      );
    };

    trackPresence();

    return () => {
      unsubscribe();
      communicationsRealtimeService.untrackUserPresence("user-id", "channel-id");
    };
  }, []);

  return <div>Advanced real-time component</div>;
}
```

### Connection Status Monitoring

All hooks provide connection status information:

```tsx
function ConnectionStatus() {
  const { isConnected: messagesConnected } = useMessages(channelId);
  const { isConnected: presenceConnected } = usePresence(channelId);
  const { isConnected: notificationsConnected } = useNotifications();

  return (
    <div className="flex gap-4">
      <div>
        Messages: {messagesConnected ? "🟢" : "🔴"}
      </div>
      <div>
        Presence: {presenceConnected ? "🟢" : "🔴"}
      </div>
      <div>
        Notifications: {notificationsConnected ? "🟢" : "🔴"}
      </div>
    </div>
  );
}
```

## Configuration

### Supabase Client

The Supabase client is automatically configured for real-time usage:

```typescript
// apps/web/src/lib/supabase.ts
export const supabase = createClient(
  env.VITE_SUPABASE_URL,
  env.VITE_SUPABASE_PUBLISHABLE_KEY,
  {
    realtime: {
      params: {
        eventsPerSecond: 10, // Adjust based on your needs
      },
    },
  }
);
```

### Database Setup

Ensure your Supabase project has Realtime enabled:

1. Go to your Supabase project dashboard
2. Navigate to Database → Replication
3. Ensure "Realtime" is enabled
4. Add tables to realtime publications if needed

## Loading States

Following the project's loading state guidelines, all data-fetching components should have corresponding skeleton components:

```tsx
// RealtimeChat.tsx
export function RealtimeChat({ channelId }: RealtimeChatProps) {
  // ... component logic
}

export function RealtimeChatSkeleton() {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar skeleton */}
      <div className="w-80 bg-white border-r border-gray-200">
        <div className="p-6">
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="space-y-2 p-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Main chat skeleton */}
      <div className="flex-1">
        <div className="p-6">
          <Skeleton className="h-6 w-40" />
        </div>
        <div className="p-4 space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="flex gap-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

## Performance Considerations

### Connection Management
- Connections are automatically managed
- Unsubscribes happen when components unmount
- No duplicate connections for the same channel

### Fallback Behavior
- If real-time connection fails, hooks fall back to polling
- Polling intervals are configurable
- Automatic reconnection attempts

### Memory Management
- Subscription cleanup is automatic
- No memory leaks from abandoned subscriptions
- Efficient channel reuse

## Troubleshooting

### Common Issues

1. **Real-time updates not working**
   - Check Supabase project settings
   - Verify Realtime is enabled in your project
   - Check browser console for connection errors

2. **High CPU usage**
   - Adjust `eventsPerSecond` in Supabase client config
   - Ensure proper cleanup in useEffect

3. **Connection drops**
   - Implement retry logic in your components
   - Monitor connection status and show user feedback

### Debug Mode

Enable debug logging:

```typescript
// In development, you can enable debug logging
if (process.env.NODE_ENV === "development") {
  console.log("Realtime service initialized");
}
```

## Migration from Polling

If you're migrating from the old polling-based system:

1. **Enable real-time in hooks**:
   ```typescript
   // Old
   useMessages(channelId);
   
   // New
   useMessages(channelId, { enableRealtime: true });
   ```

2. **Remove manual refetch intervals**:
   ```typescript
   // Old
   const query = useQuery({
     refetchInterval: 30000,
   });
   
   // New - no interval needed
   const query = useQuery({});
   ```

3. **Add connection status UI**:
   ```typescript
   const { realtimeConnected } = useMessages(channelId);
   // Show connection status to users
   ```

## Example Component

For a complete example, see `/src/components/communications/RealtimeChat.tsx`. This component demonstrates:

- Real-time message updates
- Live presence indicators
- Connection status monitoring
- Loading skeletons
- Proper error handling

This implementation provides a robust, scalable real-time communications system that seamlessly integrates with your existing architecture while providing fallback mechanisms for reliability.