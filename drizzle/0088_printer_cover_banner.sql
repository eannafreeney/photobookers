ALTER TABLE "printers" RENAME COLUMN "logo_url" TO "cover_url";
--> statement-breakpoint
ALTER TABLE "printers" ADD COLUMN IF NOT EXISTS "banner_url" text;
