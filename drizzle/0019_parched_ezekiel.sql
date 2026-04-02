CREATE TYPE "public"."interview_type" AS ENUM('introduction', 'book');--> statement-breakpoint
ALTER TABLE "creator_interviews" ADD COLUMN "interview_type" "interview_type" DEFAULT 'introduction' NOT NULL;--> statement-breakpoint
ALTER TABLE "creator_interviews" ADD COLUMN "book_id" uuid;--> statement-breakpoint
ALTER TABLE "creator_interviews" ADD CONSTRAINT "creator_interviews_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE set null ON UPDATE no action;