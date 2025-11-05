# Recursive Message Delete Implementation Improvements

## Summary of Changes

The original delete procedure had several issues that have been fixed:

### Issues with Original Implementation
1. **SQL Injection Risk**: Used `${messageTable}` interpolation which could be unsafe
2. **Column Name Mismatch**: Used `parent_message_id` directly without proper Drizzle ORM handling
3. **No Authorization**: Didn't check if user owned the message
4. **No Transaction**: Operation wasn't atomic
5. **Missing Performance Indexes**: No indexes for recursive queries
6. **No Foreign Key Constraint**: Missing referential integrity

### Improvements Made

#### 1. Enhanced Delete Procedure (`packages/api/src/routers/communication/messages.ts`)
- ✅ **Transaction Safety**: Wrapped in a database transaction
- ✅ **Authorization Check**: Verifies user owns the message
- ✅ **Proper SQL Structure**: Uses correct table names and column references
- ✅ **Thread Count Updates**: Updates parent message thread counts after deletion
- ✅ **Depth Tracking**: Includes depth tracking for debugging
- ✅ **Soft Delete with Cleanup**: Clears thread counts for deleted messages

#### 2. Database Schema Improvements (`packages/db/src/schema/communication.ts`)
- ✅ **Performance Indexes**: Added 5 critical indexes:
  - `idx_message_parent_message_id` - For recursive queries
  - `idx_message_is_deleted` - For soft delete filtering
  - `idx_message_channel_id` - For channel-based queries
  - `idx_message_channel_deleted` - Composite index for common queries
  - `idx_message_parent_deleted` - Composite index for thread queries
- ✅ **Foreign Key Constraint**: Added self-referencing foreign key with CASCADE delete
- ✅ **Proper Imports**: Added `index` import for Drizzle ORM

#### 3. Migration Files Generated
- ✅ Migration `0001_aspiring_chronomancer.sql`: Creates all performance indexes
- ✅ Migration `0002_brainy_bloodstrike.sql`: Adds foreign key constraint

## Technical Details

### Recursive Delete Query
```sql
WITH RECURSIVE message_tree AS (
  -- Start with the root message to delete
  SELECT id, parent_message_id, 1 as depth
  FROM messages 
  WHERE id = $messageId
  
  UNION ALL
  
  -- Find all child messages recursively
  SELECT m.id, m.parent_message_id, mt.depth + 1
  FROM messages m
  INNER JOIN message_tree mt ON m.parent_message_id = mt.id
  WHERE m.is_deleted = false
)
UPDATE messages 
SET 
  is_deleted = true, 
  deleted_at = NOW(),
  thread_count = 0
WHERE id IN (SELECT id FROM message_tree)
```

### Performance Benefits
- **Index Coverage**: All query patterns now have appropriate indexes
- **Recursive Query Optimization**: The `parent_message_id` index makes recursive CTEs fast
- **Composite Indexes**: Common filter combinations are optimized
- **Foreign Key Integrity**: Ensures data consistency

### Security Improvements
- **Authorization**: Users can only delete their own messages
- **Transaction Safety**: All operations are atomic
- **SQL Injection Prevention**: Proper parameterized queries

## Verification

The changes have been verified by:
1. ✅ TypeScript compilation passes for API package
2. ✅ Database migrations generated successfully
3. ✅ Database schema applied without errors
4. ✅ All indexes created successfully
5. ✅ Foreign key constraint added

## Usage Example

```typescript
// Delete a message and all its replies
const result = await messageRouter.delete.handler({
  input: { messageId: "message-id" },
  context: { db, session: { user: { id: "user-id" } } }
});

// Returns: { success: true, message: "Message deleted successfully." }
```

This implementation now follows PostgreSQL best practices for recursive operations and provides excellent performance for threaded message deletion scenarios.