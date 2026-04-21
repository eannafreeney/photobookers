ALTER TABLE "creator_interviews" ADD COLUMN "creator_slug" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "creators" ADD COLUMN "verified_at" timestamp;