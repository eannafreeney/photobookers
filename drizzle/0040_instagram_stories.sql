ALTER TABLE "book_of_the_day"
  ADD COLUMN "instagram_story_buffer_post_id" text,
  ADD COLUMN "instagram_story_queued_at" timestamp,
  ADD COLUMN "instagram_story_error" text;

ALTER TABLE "artist_of_the_week"
  ADD COLUMN "instagram_story_buffer_post_id" text,
  ADD COLUMN "instagram_story_queued_at" timestamp,
  ADD COLUMN "instagram_story_error" text;

ALTER TABLE "publisher_of_the_week"
  ADD COLUMN "instagram_story_buffer_post_id" text,
  ADD COLUMN "instagram_story_queued_at" timestamp,
  ADD COLUMN "instagram_story_error" text;
