ALTER TABLE "printers" ADD COLUMN IF NOT EXISTS "languages" text;
--> statement-breakpoint
ALTER TABLE "printers" ADD COLUMN IF NOT EXISTS "logo_url" text;
