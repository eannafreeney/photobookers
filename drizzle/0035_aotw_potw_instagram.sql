ALTER TABLE "artist_of_the_week"
  ADD COLUMN "instagram_image_url" text,
  ADD COLUMN "instagram_caption" text,
  ADD COLUMN "instagram_prepared_at" timestamp,
  ADD COLUMN "instagram_buffer_post_id" text,
  ADD COLUMN "instagram_queued_at" timestamp,
  ADD COLUMN "instagram_error" text;

ALTER TABLE "publisher_of_the_week"
  ADD COLUMN "instagram_image_url" text,
  ADD COLUMN "instagram_caption" text,
  ADD COLUMN "instagram_prepared_at" timestamp,
  ADD COLUMN "instagram_buffer_post_id" text,
  ADD COLUMN "instagram_queued_at" timestamp,
  ADD COLUMN "instagram_error" text;
