CREATE TYPE "public"."endReason" AS ENUM('manual', 'break', 'punch_out', 'idle_timeout');--> statement-breakpoint
CREATE TABLE "work_block" (
	"id" varchar(24) PRIMARY KEY NOT NULL,
	"attendanceId" text NOT NULL,
	"userId" text NOT NULL,
	"startedAt" timestamp with time zone NOT NULL,
	"endedAt" timestamp with time zone,
	"durationMinutes" integer,
	"endReason" "endReason",
	"createdAt" timestamp with time zone NOT NULL,
	"updatedAt" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "attendance" ALTER COLUMN "breakDuration" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "message" ALTER COLUMN "channelId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "work_block" ADD CONSTRAINT "work_block_attendanceId_attendance_id_fk" FOREIGN KEY ("attendanceId") REFERENCES "public"."attendance"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_block" ADD CONSTRAINT "work_block_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;