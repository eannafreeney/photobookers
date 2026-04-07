ALTER TABLE "artist_of_the_week" ADD COLUMN "email_sent_at" timestamp;--> statement-breakpoint
ALTER TABLE "book_of_the_week" ADD COLUMN "artist_email_sent_at" timestamp;--> statement-breakpoint
ALTER TABLE "book_of_the_week" ADD COLUMN "publisher_email_sent_at" timestamp;--> statement-breakpoint
ALTER TABLE "publisher_of_the_week" ADD COLUMN "email_sent_at" timestamp;--> statement-breakpoint
ALTER TABLE "artist_of_the_week" DROP COLUMN "text";--> statement-breakpoint
ALTER TABLE "book_of_the_week" DROP COLUMN "text";--> statement-breakpoint
ALTER TABLE "publisher_of_the_week" DROP COLUMN "text";