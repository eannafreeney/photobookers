ALTER TABLE "creators" ADD COLUMN "verified_instagram_queued_at" timestamp;--> statement-breakpoint
ALTER TABLE "creators" ADD COLUMN "verified_instagram_buffer_post_id" text;--> statement-breakpoint
ALTER TABLE "creators" ADD COLUMN "verified_instagram_error" text;