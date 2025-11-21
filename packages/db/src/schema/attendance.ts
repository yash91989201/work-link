import { cuid2 } from "drizzle-cuid2/postgres";
import {
  boolean,
  date,
  decimal,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { organization, team, user } from "./auth";

// Define PostgreSQL enums for attendance
export const attendanceStatusEnum = pgEnum("attendanceStatus", [
  "present",
  "absent",
  "late",
  "excused",
  "partial",
  "holiday",
  "sick_leave",
  "work_from_home",
]);

export const clockInMethodEnum = pgEnum("clockInMethod", [
  "manual",
  "qr_code",
  "geofence",
  "ip_restriction",
  "biometric",
  "rfid",
]);

export const clockOutMethodEnum = pgEnum("clockOutMethod", [
  "manual",
  "qr_code",
  "geofence",
  "ip_restriction",
  "biometric",
  "rfid",
  "auto",
]);

export const attendanceTable = pgTable("attendance", {
  id: cuid2().defaultRandom().primaryKey(),
  userId: text()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  organizationId: text()
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  teamId: text().references(() => team.id, { onDelete: "cascade" }),
  date: date({ mode: "date" }).notNull(),
  status: attendanceStatusEnum().notNull().default("present"),
  checkInTime: timestamp({ withTimezone: true }),
  checkOutTime: timestamp({ withTimezone: true }),
  totalHours: decimal({ precision: 4, scale: 2 }),
  breakDuration: integer().default(0), // Total break time in minutes
  location: text(),
  coordinates: text(),
  ipAddress: text(),
  deviceInfo: text(),
  notes: text(),
  adminNotes: text(),
  verifiedBy: text().references(() => user.id),
  isManualEntry: boolean().default(false).notNull(),
  isApproved: boolean().default(true).notNull(),
  approvedBy: text().references(() => user.id),
  approvedAt: timestamp({ withTimezone: true }),
  clockInMethod: clockInMethodEnum().default("manual"),
  clockOutMethod: clockOutMethodEnum(),
  shiftId: text(),
  overtimeHours: decimal({ precision: 4, scale: 2 }),
  isDeleted: boolean().default(false).notNull(),
  createdAt: timestamp({ withTimezone: true })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp({ withTimezone: true })
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date())
    .notNull(),
});

// Define end reason enum for work blocks
export const endReasonEnum = pgEnum("endReason", [
  "manual",
  "break",
  "punch_out",
  "idle_timeout",
]);

// Work block table for tracking continuous working sessions
export const workBlockTable = pgTable("workBlock", {
  id: cuid2().defaultRandom().primaryKey(),
  attendanceId: text()
    .notNull()
    .references(() => attendanceTable.id, { onDelete: "cascade" }),
  userId: text()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  startedAt: timestamp({ withTimezone: true }).notNull(),
  endedAt: timestamp({ withTimezone: true }),
  durationMinutes: integer(),
  endReason: endReasonEnum(),
  createdAt: timestamp({ withTimezone: true })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp({ withTimezone: true })
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date())
    .notNull(),
});
