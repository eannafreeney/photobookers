CREATE TYPE "public"."creator_interview_status" AS ENUM('sent', 'completed', 'expired');--> statement-breakpoint
CREATE TABLE "creator_interviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" uuid NOT NULL,
	"recipient_email" text NOT NULL,
	"invite_token" varchar(255) NOT NULL,
	"invited_by_user_id" uuid,
	"status" "creator_interview_status" DEFAULT 'sent' NOT NULL,
	"invited_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"expires_at" timestamp,
	"answers" jsonb,
	CONSTRAINT "creator_interviews_invite_token_unique" UNIQUE("invite_token")
);
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "creator_interviews" ADD CONSTRAINT "creator_interviews_creator_id_creators_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."creators"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_interviews" ADD CONSTRAINT "creator_interviews_invited_by_user_id_users_id_fk" FOREIGN KEY ("invited_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;