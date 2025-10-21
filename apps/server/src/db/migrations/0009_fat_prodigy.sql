ALTER TABLE "message" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "message" ALTER COLUMN "type" SET DEFAULT 'text'::text;--> statement-breakpoint
DROP TYPE "public"."message_type";--> statement-breakpoint
CREATE TYPE "public"."message_type" AS ENUM('text', 'attachment');--> statement-breakpoint
ALTER TABLE "message" ALTER COLUMN "type" SET DEFAULT 'text'::"public"."message_type";--> statement-breakpoint
ALTER TABLE "message" ALTER COLUMN "type" SET DATA TYPE "public"."message_type" USING "type"::"public"."message_type";