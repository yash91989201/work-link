# Attendance + Working Hours + Presence System

## Overview

This system provides comprehensive tracking of member attendance, working hours, and real-time presence status in the teams collaboration platform.

## Architecture

### Database Layer (PostgreSQL + Drizzle)

#### Attendance Table
- Tracks daily attendance records per member
- Key fields:
  - `checkInTime`, `checkOutTime`: Punch in/out timestamps
  - `breakDuration`: Total break time in minutes (integer)
  - `totalHours`: Computed work hours at punch-out
  - `status`: Day-level status (present, absent, etc.)

#### Work Block Table
- Tracks continuous working sessions within a day
- Key fields:
  - `attendanceId`: Links to attendance record
  - `startedAt`, `endedAt`: Session timestamps
  - `durationMinutes`: Computed duration
  - `endReason`: Why the block ended (break, manual, punch_out, idle_timeout)

### Presence Layer (Redis)

Presence data is stored in Redis with a 5-minute TTL:

```
Key: presence:user:{userId}
Type: Hash
Fields:
  - status: current presence status
  - lastSeenAt: unix timestamp (ms)
  - orgId: active organization
  - punchedIn: "0" or "1"
  - onBreak: "0" or "1"
  - inCall: "0" or "1"
  - inMeeting: "0" or "1"
  - manualStatus: "dnd" | "busy" | "away" | ""
```

### Presence Status Computation

Status is computed with the following priority:

1. **Manual Overrides**: DND → Busy → Away
2. **System States**: Offline (not punched in) → On Break → In Call → In Meeting
3. **Activity-based**: Away (if not focused or idle > 15 min)
4. **Default**: Available

## API Endpoints (ORPC)

### Attendance Router (`/rpc/member.attendance`)

#### `punchIn`
Start the work day. Creates attendance record and initial work block.

**Input:**
```typescript
{
  note?: string,
  location?: string
}
```

**Output:** Attendance record

#### `punchOut`
End the work day. Closes active work block and computes total hours.

**Input:**
```typescript
{
  note?: string,
  location?: string
}
```

**Output:** Updated attendance record

#### `addBreakDuration`
Add break minutes to the daily total. Called when a break ends.

**Input:**
```typescript
{
  attendanceId: string,
  minutes: number // 0-480 (max 8 hours)
}
```

**Output:**
```typescript
{
  breakDuration: number
}
```

#### `getToday`
Get today's attendance record for a member in an organization.

**Input:**
```typescript
{
  orgId: string
}
```

**Output:** Attendance record or null

### Work Block Router (`/rpc/member.workBlock`)

#### `startBlock`
Start a new working session. Cannot start if one is already active.

**Input:**
```typescript
{
  attendanceId: string,
  reason?: string
}
```

**Output:** Work block record

#### `endBlock`
End the active working session. Computes duration.

**Input:**
```typescript
{
  attendanceId: string,
  endReason: string
}
```

**Output:** Updated work block record

### Presence Router (`/rpc/member.presence`)

#### `heartbeat`
Update presence status. Should be called every 30-60 seconds from client.

**Input:**
```typescript
{
  orgId: string,
  punchedIn: boolean,
  onBreak: boolean,
  inCall: boolean,
  inMeeting: boolean,
  isTabFocused: boolean,
  isIdle: boolean, // true if idle > 15 min
  manualStatus?: "dnd" | "busy" | "away" | null
}
```

**Output:**
```typescript
{
  status: PresenceStatus
}
```

#### `setManualStatus`
Set manual presence status override.

**Input:**
```typescript
{
  orgId: string,
  status: "dnd" | "busy" | "away" | null
}
```

**Output:**
```typescript
{
  ok: boolean
}
```

#### `getOrgPresence`
Get presence for all members in an organization.

**Input:**
```typescript
{
  orgId: string
}
```

**Output:**
```typescript
{
  presence: Record<userId, PresenceData>
}
```

## Workflows

### Starting Work Day

1. Client calls `punchIn({ note: "Starting work" })`
2. System creates attendance record with `checkInTime`
3. System creates initial work block with `startedAt`
4. Client starts sending presence heartbeats

### Taking a Break

1. Client calls `endBlock({ attendanceId, endReason: "break" })`
2. System closes current work block
3. Client tracks break start time locally
4. Presence heartbeat sent with `onBreak: true`

### Returning from Break

1. Client calculates break duration in minutes
2. Client calls `addBreakDuration({ attendanceId, minutes })`
3. Client calls `startBlock({ attendanceId })`
4. System creates new work block
5. Presence heartbeat sent with `onBreak: false`

### Ending Work Day

1. Client calls `punchOut({ note: "End of day" })`
2. System closes active work block if exists
3. System computes `totalHours = (checkOutTime - checkInTime - breakDuration) / 60`
4. Client stops sending presence heartbeats
5. After 5 minutes, presence expires to "offline"

## Frontend Integration

### Presence Heartbeat Hook

```typescript
// Example hook for presence heartbeat
function usePresenceHeartbeat() {
  const { data: attendance } = useAttendance();
  const { mutate: sendHeartbeat } = useMutation({
    mutationFn: client.member.presence.heartbeat
  });

  useEffect(() => {
    const interval = setInterval(() => {
      sendHeartbeat({
        orgId: currentOrg.id,
        punchedIn: !!attendance,
        onBreak: breakState.isOnBreak,
        inCall: callState.isInCall,
        inMeeting: meetingState.isInMeeting,
        isTabFocused: document.hasFocus(),
        isIdle: getIdleTime() > 15 * 60 * 1000,
        manualStatus: userPreference.manualStatus
      });
    }, 60000); // Every 60 seconds

    return () => clearInterval(interval);
  }, [attendance, breakState, callState, meetingState]);
}
```

### Break Timer Component

```typescript
function BreakTimer() {
  const [breakStart, setBreakStart] = useState<Date | null>(null);
  const { mutate: endBlock } = useMutation(client.member.workBlock.endBlock);
  const { mutate: startBlock } = useMutation(client.member.workBlock.startBlock);
  const { mutate: addBreakDuration } = useMutation(client.member.attendance.addBreakDuration);

  const handleStartBreak = async () => {
    await endBlock({ 
      attendanceId: attendance.id, 
      endReason: "break" 
    });
    setBreakStart(new Date());
  };

  const handleEndBreak = async () => {
    const minutes = Math.floor((Date.now() - breakStart!.getTime()) / 60000);
    
    await Promise.all([
      addBreakDuration({ attendanceId: attendance.id, minutes }),
      startBlock({ attendanceId: attendance.id })
    ]);
    
    setBreakStart(null);
  };

  // ... render break timer UI
}
```

## Environment Variables

```bash
# Redis connection string (optional - presence features disabled if not set)
REDIS_URL=redis://localhost:6379
```

## Docker Setup

Redis is included in docker-compose.yml:

```bash
docker-compose up redis -d
```

## Database Migrations

Generate migrations after schema changes:

```bash
bun run db:generate
bun run db:migrate
```

## Error Handling

All endpoints include proper error handling:

- `NOT_FOUND`: Resource not found (attendance, organization, etc.)
- `CONFLICT`: Invalid state (e.g., trying to punch out without punching in)
- `FORBIDDEN`: User not authorized (e.g., not a member of organization)
- `INTERNAL_SERVER_ERROR`: System errors (database, Redis failures)

## Performance Considerations

1. **Redis TTL**: Presence keys expire after 5 minutes of no heartbeat
2. **Heartbeat Frequency**: Recommended 30-60 seconds to balance accuracy and load
3. **Batch Presence Queries**: Use `getOrgPresence` instead of individual queries
4. **Index Recommendations**: Consider indexes on:
   - `attendance(userId, organizationId, date)`
   - `work_block(attendanceId, endedAt)`

## Testing

Key test scenarios:

1. Punch in/out lifecycle
2. Multiple work blocks in a day
3. Break duration accumulation
4. Presence status computation priority
5. Graceful Redis unavailability
6. Concurrent work block operations
7. Edge cases (midnight boundary, long breaks, etc.)

## Security

- All endpoints require authentication
- Users can only access their own attendance records
- Organization membership is validated
- Input validation via Zod schemas
- No sensitive data in presence (computed from client state)

## Future Enhancements

Potential improvements:

1. Automatic idle detection and work block closing
2. Break reminders and suggestions
3. Historical presence analytics
4. Team-wide presence dashboard
5. Integration with calendar for meetings
6. Geofencing for punch in/out
7. QR code or biometric clock-in methods
