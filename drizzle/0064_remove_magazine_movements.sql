ALTER TABLE "magazine_issue_books" DROP COLUMN IF EXISTS "movement_id";--> statement-breakpoint
ALTER TABLE "magazine_issues" DROP COLUMN IF EXISTS "movements";
