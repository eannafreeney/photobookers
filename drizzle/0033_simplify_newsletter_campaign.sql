-- Compare as text so this works in the same migrate batch as 0031's ADD VALUE 'scheduled'
UPDATE "newsletter_campaigns"
SET "status" = 'draft'
WHERE "status"::text IN ('approved', 'scheduled');
--> statement-breakpoint
ALTER TABLE "newsletter_campaigns" DROP COLUMN IF EXISTS "approved_by_user_id";
--> statement-breakpoint
ALTER TABLE "newsletter_campaigns" DROP COLUMN IF EXISTS "approved_at";
--> statement-breakpoint
ALTER TABLE "newsletter_campaigns" DROP COLUMN IF EXISTS "scheduled_send_at";
--> statement-breakpoint
ALTER TABLE "newsletter_campaigns" DROP COLUMN IF EXISTS "last_error";
