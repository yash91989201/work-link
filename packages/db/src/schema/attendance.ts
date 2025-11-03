import { cuid2 } from "drizzle-cuid2/postgres";
import {
  boolean,
  date,
  decimal,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { organization, team, user } from "./auth";

// Define PostgreSQL enums for attendance
export const attendanceStatusEnum = pgEnum("attendance_status", [
  "present",
  "absent",
  "late",
  "excused",
  "partial",
  "holiday",
  "sick_leave",
  "work_from_home",
]);

export const clockInMethodEnum = pgEnum("clock_in_method", [
  "manual",
  "qr_code",
  "geofence",
  "ip_restriction",
  "biometric",
  "rfid",
]);

export const clockOutMethodEnum = pgEnum("clock_out_method", [
  "manual",
  "qr_code",
  "geofence",
  "ip_restriction",
  "biometric",
  "rfid",
  "auto",
]);

export const attendanceTable = pgTable("attendance", {
  id: cuid2("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  teamId: text("team_id").references(() => team.id, { onDelete: "cascade" }),
  date: date("date", { mode: "date" }).notNull(),
  status: attendanceStatusEnum("status").notNull().default("present"),
  checkInTime: timestamp("check_in_time", { withTimezone: true }),
  checkOutTime: timestamp("check_out_time", { withTimezone: true }),
  totalHours: decimal("total_hours", { precision: 4, scale: 2 }), // More precise decimal storage
  breakDuration: decimal("break_duration", { precision: 4, scale: 2 }), // Track break time
  location: text("location"), // For location-based attendance
  coordinates: text("coordinates"), // Store lat,lng for geo-fencing
  ipAddress: text("ip_address"), // For verification
  deviceInfo: text("device_info"), // Device used for check-in
  notes: text("notes"), // Additional remarks
  adminNotes: text("admin_notes"), // Admin-only notes
  verifiedBy: text("verified_by").references(() => user.id), // Admin who verified/modified
  isManualEntry: boolean("is_manual_entry").default(false).notNull(), // Was this manually entered by admin
  isApproved: boolean("is_approved").default(true).notNull(), // Approval status for time tracking
  approvedBy: text("approved_by").references(() => user.id), // Who approved the attendance
  approvedAt: timestamp("approved_at", { withTimezone: true }), // When was it approved
  clockInMethod: clockInMethodEnum("clock_in_method").default("manual"),
  clockOutMethod: clockOutMethodEnum("clock_out_method"),
  shiftId: text("shift_id"), // Reference to shift if using shift management
  overtimeHours: decimal("overtime_hours", { precision: 4, scale: 2 }), // Track overtime
  isDeleted: boolean("is_deleted").default(false).notNull(), // Soft delete
  createdAt: timestamp("created_at", { withTimezone: true })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date())
    .notNull(),
});
