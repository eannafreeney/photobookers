DROP TABLE IF EXISTS "featured_books_of_the_week" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "book_of_the_week" CASCADE;--> statement-breakpoint
ALTER TABLE "book_of_the_day" DROP COLUMN IF EXISTS "text";--> statement-breakpoint
ALTER TABLE "book_of_the_day" ADD COLUMN "artist_email_sent_at" timestamp;--> statement-breakpoint
ALTER TABLE "book_of_the_day" ADD COLUMN "publisher_email_sent_at" timestamp;
