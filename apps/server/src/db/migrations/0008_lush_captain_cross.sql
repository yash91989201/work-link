ALTER TABLE "attachment" RENAME COLUMN "thumbnail_path" TO "thumbnail_url";--> statement-breakpoint
ALTER TABLE "message" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "message" ALTER COLUMN "type" SET DEFAULT 'text'::text;--> statement-breakpoint
DROP TYPE "public"."message_type";--> statement-breakpoint
CREATE TYPE "public"."message_type" AS ENUM('text', 'file', 'image', 'video', 'reply');--> statement-breakpoint
ALTER TABLE "message" ALTER COLUMN "type" SET DEFAULT 'text'::"public"."message_type";--> statement-breakpoint
ALTER TABLE "message" ALTER COLUMN "type" SET DATA TYPE "public"."message_type" USING "type"::"public"."message_type";--> statement-breakpoint
ALTER TABLE "notification" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."notification_type";--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('message', 'mention', 'channel_invite', 'direct_message');--> statement-breakpoint
ALTER TABLE "notification" ALTER COLUMN "type" SET DATA TYPE "public"."notification_type" USING "type"::"public"."notification_type";--> statement-breakpoint
ALTER TABLE "attachment" ADD COLUMN "url" text;--> statement-breakpoint
ALTER TABLE "attachment" ADD COLUMN "updated_at" timestamp with time zone NOT NULL;--> statement-breakpoint
ALTER TABLE "attachment" DROP COLUMN "supabase_storage_path";--> statement-breakpoint
ALTER TABLE "attachment" DROP COLUMN "supabase_bucket";--> statement-breakpoint
ALTER TABLE "attachment" DROP COLUMN "metadata";--> statement-breakpoint
ALTER TABLE "channel" DROP COLUMN "metadata";--> statement-breakpoint
ALTER TABLE "message" DROP COLUMN "metadata";