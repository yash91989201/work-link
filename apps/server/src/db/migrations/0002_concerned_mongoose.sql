CREATE TYPE "public"."attachment_type" AS ENUM('image', 'document', 'video', 'audio', 'archive', 'other');--> statement-breakpoint
CREATE TYPE "public"."channel_type" AS ENUM('team', 'direct', 'announcement', 'project');--> statement-breakpoint
CREATE TYPE "public"."message_type" AS ENUM('text', 'file', 'image', 'system', 'reply');--> statement-breakpoint
CREATE TYPE "public"."notification_status" AS ENUM('unread', 'read', 'dismissed');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('message', 'mention', 'channel_invite', 'direct_message', 'announcement', 'system');--> statement-breakpoint
CREATE TABLE "attachment" (
	"id" varchar(24) PRIMARY KEY NOT NULL,
	"message_id" text NOT NULL,
	"file_name" text NOT NULL,
	"original_name" text NOT NULL,
	"file_size" integer NOT NULL,
	"mime_type" text NOT NULL,
	"type" "attachment_type" NOT NULL,
	"supabase_storage_path" text NOT NULL,
	"supabase_bucket" text NOT NULL,
	"thumbnail_path" text,
	"uploaded_by" text NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"metadata" json,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "channel_member" (
	"id" varchar(24) PRIMARY KEY NOT NULL,
	"channel_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"joined_at" timestamp with time zone NOT NULL,
	"last_read_at" timestamp with time zone,
	"is_muted" boolean DEFAULT false NOT NULL,
	"notification_settings" json
);
--> statement-breakpoint
CREATE TABLE "channel" (
	"id" varchar(24) PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"type" "channel_type" DEFAULT 'team' NOT NULL,
	"organization_id" text NOT NULL,
	"team_id" text,
	"created_by" text NOT NULL,
	"is_private" boolean DEFAULT false NOT NULL,
	"is_archived" boolean DEFAULT false NOT NULL,
	"last_message_at" timestamp with time zone,
	"message_count" integer DEFAULT 0 NOT NULL,
	"metadata" json,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "message_read" (
	"id" varchar(24) PRIMARY KEY NOT NULL,
	"message_id" text NOT NULL,
	"user_id" text NOT NULL,
	"read_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "message" (
	"id" varchar(24) PRIMARY KEY NOT NULL,
	"channel_id" text,
	"sender_id" text NOT NULL,
	"receiver_id" text,
	"content" text,
	"type" "message_type" DEFAULT 'text' NOT NULL,
	"parent_message_id" text,
	"thread_count" integer DEFAULT 0 NOT NULL,
	"is_edited" boolean DEFAULT false NOT NULL,
	"edited_at" timestamp with time zone,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp with time zone,
	"mentions" json,
	"reactions" json,
	"metadata" json,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification" (
	"id" varchar(24) PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" "notification_type" NOT NULL,
	"status" "notification_status" DEFAULT 'unread' NOT NULL,
	"title" text NOT NULL,
	"message" text,
	"entity_id" text,
	"entity_type" text,
	"action_url" text,
	"metadata" json,
	"read_at" timestamp with time zone,
	"dismissed_at" timestamp with time zone,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_presence" (
	"user_id" text PRIMARY KEY NOT NULL,
	"status" text DEFAULT 'offline' NOT NULL,
	"last_seen" timestamp with time zone NOT NULL,
	"current_channel_id" text,
	"custom_status" text,
	"status_emoji" text,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "attachment" ADD CONSTRAINT "attachment_message_id_message_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."message"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attachment" ADD CONSTRAINT "attachment_uploaded_by_user_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channel_member" ADD CONSTRAINT "channel_member_channel_id_channel_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."channel"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channel_member" ADD CONSTRAINT "channel_member_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channel" ADD CONSTRAINT "channel_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channel" ADD CONSTRAINT "channel_team_id_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channel" ADD CONSTRAINT "channel_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_read" ADD CONSTRAINT "message_read_message_id_message_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."message"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_read" ADD CONSTRAINT "message_read_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message" ADD CONSTRAINT "message_channel_id_channel_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."channel"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message" ADD CONSTRAINT "message_sender_id_user_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message" ADD CONSTRAINT "message_receiver_id_user_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_presence" ADD CONSTRAINT "user_presence_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_presence" ADD CONSTRAINT "user_presence_current_channel_id_channel_id_fk" FOREIGN KEY ("current_channel_id") REFERENCES "public"."channel"("id") ON DELETE no action ON UPDATE no action;