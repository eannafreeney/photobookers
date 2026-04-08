ALTER TABLE "featured_books_of_the_week" ADD COLUMN "artist_email_sent_at" timestamp;--> statement-breakpoint
ALTER TABLE "featured_books_of_the_week" ADD COLUMN "publisher_email_sent_at" timestamp;--> statement-breakpoint
ALTER TABLE "featured_books_of_the_week" DROP COLUMN "email_sent_at";