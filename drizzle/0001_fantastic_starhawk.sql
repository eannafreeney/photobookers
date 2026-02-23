ALTER TABLE "creators" ADD COLUMN IF NOT EXISTS "facebook" text;--> statement-breakpoint
ALTER TABLE "creators" ADD COLUMN IF NOT EXISTS "twitter" text;--> statement-breakpoint
ALTER TABLE "creators" ADD COLUMN IF NOT EXISTS "instagram" text;--> statement-breakpoint
ALTER TABLE "creators" ADD COLUMN IF NOT EXISTS "website" text;--> statement-breakpoint
ALTER TABLE "books" DROP COLUMN IF EXISTS "facebook";--> statement-breakpoint
ALTER TABLE "books" DROP COLUMN IF EXISTS "twitter";--> statement-breakpoint
ALTER TABLE "books" DROP COLUMN IF EXISTS "instagram";