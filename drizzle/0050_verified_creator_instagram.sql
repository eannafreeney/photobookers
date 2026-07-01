ALTER TABLE "creators" ADD COLUMN IF NOT EXISTS "verified_instagram_queued_at" timestamp;
ALTER TABLE "creators" ADD COLUMN IF NOT EXISTS "verified_instagram_buffer_post_id" text;
ALTER TABLE "creators" ADD COLUMN IF NOT EXISTS "verified_instagram_error" text;
