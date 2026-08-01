ALTER TABLE "artist_of_the_week" ADD COLUMN "artist_provided_story_image_url" text;
ALTER TABLE "artist_of_the_week" ADD COLUMN "artist_story_image_email_sent_at" timestamp;
ALTER TABLE "publisher_of_the_week" ADD COLUMN "artist_provided_story_image_url" text;
ALTER TABLE "publisher_of_the_week" ADD COLUMN "artist_story_image_email_sent_at" timestamp;
