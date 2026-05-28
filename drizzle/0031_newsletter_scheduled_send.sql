DO $$ BEGIN
  ALTER TYPE "public"."newsletter_campaign_status" ADD VALUE 'scheduled';
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "newsletter_campaigns" ADD COLUMN IF NOT EXISTS "scheduled_send_at" timestamp;
