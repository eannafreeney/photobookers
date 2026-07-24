ALTER TABLE "book_fairs" ADD COLUMN IF NOT EXISTS "instagram_queued_at" timestamp;--> statement-breakpoint
ALTER TABLE "book_fairs" ADD COLUMN IF NOT EXISTS "instagram_buffer_post_id" text;--> statement-breakpoint
ALTER TABLE "book_fairs" ADD COLUMN IF NOT EXISTS "instagram_error" text;
