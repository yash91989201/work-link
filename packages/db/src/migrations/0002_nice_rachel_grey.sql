ALTER TABLE "work_block" RENAME TO "workBlock";--> statement-breakpoint
ALTER TABLE "workBlock" DROP CONSTRAINT "work_block_attendanceId_attendance_id_fk";
--> statement-breakpoint
ALTER TABLE "workBlock" DROP CONSTRAINT "work_block_userId_user_id_fk";
--> statement-breakpoint
ALTER TABLE "workBlock" ADD CONSTRAINT "workBlock_attendanceId_attendance_id_fk" FOREIGN KEY ("attendanceId") REFERENCES "public"."attendance"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workBlock" ADD CONSTRAINT "workBlock_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;