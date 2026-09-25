ALTER TABLE "print_quote_requests" DROP COLUMN "copies";
--> statement-breakpoint
ALTER TABLE "print_quote_requests" DROP COLUMN "page_count";
--> statement-breakpoint
ALTER TABLE "print_quote_requests" DROP COLUMN "trim_size";
--> statement-breakpoint
ALTER TABLE "print_quote_requests" DROP COLUMN "binding";
--> statement-breakpoint
ALTER TABLE "print_quote_requests" DROP COLUMN "deadline";
--> statement-breakpoint
ALTER TABLE "print_quote_requests" DROP COLUMN "reference_books";
--> statement-breakpoint
ALTER TABLE "print_quote_requests" ADD COLUMN "project_name" text NOT NULL DEFAULT '';
--> statement-breakpoint
ALTER TABLE "print_quote_requests" ADD COLUMN "details" text NOT NULL DEFAULT '';
--> statement-breakpoint
ALTER TABLE "print_quote_requests" ALTER COLUMN "project_name" DROP DEFAULT;
--> statement-breakpoint
ALTER TABLE "print_quote_requests" ALTER COLUMN "details" DROP DEFAULT;
--> statement-breakpoint
ALTER TABLE "print_quote_requests" RENAME COLUMN "message" TO "note";
