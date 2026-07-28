ALTER TABLE "book_fairs" DROP COLUMN IF EXISTS "approval_status";--> statement-breakpoint
DROP TYPE IF EXISTS "public"."book_fair_approval_status";
