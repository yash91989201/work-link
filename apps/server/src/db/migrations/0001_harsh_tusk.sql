CREATE TYPE "public"."attendance_status" AS ENUM('present', 'absent', 'late', 'excused', 'partial', 'holiday', 'sick_leave', 'work_from_home');--> statement-breakpoint
CREATE TYPE "public"."clock_in_method" AS ENUM('manual', 'qr_code', 'geofence', 'ip_restriction', 'biometric', 'rfid');--> statement-breakpoint
CREATE TYPE "public"."clock_out_method" AS ENUM('manual', 'qr_code', 'geofence', 'ip_restriction', 'biometric', 'rfid', 'auto');--> statement-breakpoint
CREATE TABLE "attendance" (
	"id" varchar(24) PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"team_id" text,
	"date" date NOT NULL,
	"status" "attendance_status" DEFAULT 'present' NOT NULL,
	"check_in_time" timestamp with time zone,
	"check_out_time" timestamp with time zone,
	"total_hours" numeric(4, 2),
	"break_duration" numeric(4, 2),
	"location" text,
	"coordinates" text,
	"ip_address" text,
	"device_info" text,
	"notes" text,
	"admin_notes" text,
	"verified_by" text,
	"is_manual_entry" boolean DEFAULT false NOT NULL,
	"is_approved" boolean DEFAULT true NOT NULL,
	"approved_by" text,
	"approved_at" timestamp with time zone,
	"clock_in_method" "clock_in_method" DEFAULT 'manual',
	"clock_out_method" "clock_out_method",
	"shift_id" text,
	"overtime_hours" numeric(4, 2),
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_team_id_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_verified_by_user_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_approved_by_user_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;