ALTER TABLE "newsletter_campaigns" DROP COLUMN IF EXISTS "mailerlite_campaign_id";
--> statement-breakpoint
ALTER TABLE "newsletter_campaigns" DROP COLUMN IF EXISTS "mailerlite_last_synced_at";
