ALTER TABLE "creators" ADD COLUMN IF NOT EXISTS "verified_instagram_preview_email_sent_at" timestamp;
ALTER TABLE "creators" ADD COLUMN IF NOT EXISTS "verified_instagram_cancelled_at" timestamp;
