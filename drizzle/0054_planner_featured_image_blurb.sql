ALTER TABLE "book_of_the_day" RENAME COLUMN "instagram_image_url" TO "featured_image_url";
--> statement-breakpoint
ALTER TABLE "artist_of_the_week" RENAME COLUMN "instagram_image_url" TO "featured_image_url";
--> statement-breakpoint
ALTER TABLE "publisher_of_the_week" RENAME COLUMN "instagram_image_url" TO "featured_image_url";
--> statement-breakpoint
ALTER TABLE "book_of_the_day" ADD COLUMN "spotlight_blurb" text;
--> statement-breakpoint
ALTER TABLE "artist_of_the_week" ADD COLUMN "spotlight_blurb" text;
--> statement-breakpoint
ALTER TABLE "publisher_of_the_week" ADD COLUMN "spotlight_blurb" text;
--> statement-breakpoint
ALTER TABLE "artist_of_the_week" ADD COLUMN "content_preview_email_sent_at" timestamp;
