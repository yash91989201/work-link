ALTER TABLE "message" DROP CONSTRAINT "message_parent_message_id_message_id_fk";
--> statement-breakpoint
ALTER TABLE "message" ADD CONSTRAINT "fk_message_parent" FOREIGN KEY ("parent_message_id") REFERENCES "public"."message"("id") ON DELETE cascade ON UPDATE no action;