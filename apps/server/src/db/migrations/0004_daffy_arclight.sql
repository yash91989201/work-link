ALTER TABLE "channel_member" DROP CONSTRAINT "channel_member_channel_id_user_id_unique";--> statement-breakpoint
ALTER TABLE "channel" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "channel" ALTER COLUMN "type" SET DEFAULT 'team'::text;--> statement-breakpoint
DROP TYPE "public"."channel_type";--> statement-breakpoint
CREATE TYPE "public"."channel_type" AS ENUM('team', 'group', 'direct');--> statement-breakpoint
ALTER TABLE "channel" ALTER COLUMN "type" SET DEFAULT 'team'::"public"."channel_type";--> statement-breakpoint
ALTER TABLE "channel" ALTER COLUMN "type" SET DATA TYPE "public"."channel_type" USING "type"::"public"."channel_type";--> statement-breakpoint
CREATE UNIQUE INDEX "unique_channel_user" ON "channel_member" USING btree ("channel_id","user_id");