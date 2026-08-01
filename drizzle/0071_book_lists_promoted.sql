ALTER TABLE "book_lists" ADD COLUMN IF NOT EXISTS "is_promoted" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
ALTER TABLE "book_lists" ADD COLUMN IF NOT EXISTS "promoted_at" timestamp;
