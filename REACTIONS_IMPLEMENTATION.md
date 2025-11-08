# Message Reactions Implementation

## Overview
Implemented WhatsApp/Discord-style message reactions using the frimousse emoji picker library.

## Changes Made

### Backend (API & Database)

1. **Database Schema** (`packages/db/src/schema/communication.ts`)
   - Updated `messageTable.reactions` field type from `{ reaction: string; count: number }[]` to `{ reaction: string; userId: string; createdAt: string }[]`
   - This allows tracking individual user reactions instead of just counts

2. **API Endpoints** (`packages/api/src/routers/communication/message.ts`)
   - Added `addReaction` endpoint: Adds a reaction to a message
   - Added `removeReaction` endpoint: Removes a user's reaction from a message
   - Both endpoints handle optimistic updates and realtime broadcasting

### Frontend (React Components & Hooks)

3. **Reaction Mutations Hook** (`apps/web/src/hooks/communications/use-reaction-mutations.ts`)
   - Manages adding and removing reactions with optimistic updates
   - Broadcasts reaction changes via realtime channel
   - Handles error rollback

4. **Reaction Picker Component** (`apps/web/src/components/member/communication/channels/message-list/reaction-picker.tsx`)
   - Emoji picker popover using frimousse library
   - Allows users to select emojis to react with
   - Integrated into message actions

5. **Message Reactions Display** (`apps/web/src/components/member/communication/channels/message-list/message-reactions.tsx`)
   - Shows all reactions grouped by emoji with counts
   - Highlights reactions from the current user
   - Shows tooltip with user names on hover
   - Click to add/remove reactions

6. **Message Actions Update** (`apps/web/src/components/member/communication/channels/message-list/message-actions.tsx`)
   - Added reaction picker button to message action toolbar
   - Shows on message hover with other actions (reply, edit, pin, delete)

7. **Message Item Integration** (`apps/web/src/components/member/communication/channels/message-list/message-item.tsx`)
   - Integrated reaction picker and display into messages
   - Handles reaction callbacks

8. **Realtime Updates** (`apps/web/src/hooks/communications/use-messages-realtime.ts`)
   - Added `reaction-added` event handler
   - Added `reaction-removed` event handler
   - Updates query cache in real-time for all users

## Features

- ✅ Add reactions to messages with emoji picker
- ✅ Remove reactions by clicking on your own reaction
- ✅ See reaction counts grouped by emoji
- ✅ View who reacted with tooltip (shows user names)
- ✅ Highlight your own reactions
- ✅ Real-time reaction updates across all clients
- ✅ Optimistic UI updates for instant feedback
- ✅ Works on both parent messages and thread replies

## Usage

1. Hover over any message to see the action toolbar
2. Click the smile icon (😊) to open the emoji picker
3. Select an emoji to add your reaction
4. Click on an existing reaction to toggle it (add/remove your reaction)
5. Hover over reactions to see who reacted

## Technical Details

- Uses frimousse library for emoji picker (already installed)
- Reactions stored as JSON array in database
- Each reaction includes: emoji, userId, and createdAt timestamp
- Real-time sync via Supabase broadcast channels
- Optimistic updates for better UX
