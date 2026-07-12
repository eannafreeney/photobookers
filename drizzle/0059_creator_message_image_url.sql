ALTER TABLE "creator_messages" ADD COLUMN "image_url" text;--> statement-breakpoint
UPDATE "creator_messages" SET "image_url" = "image_urls"[1] WHERE "image_urls" IS NOT NULL AND cardinality("image_urls") > 0;--> statement-breakpoint
ALTER TABLE "creator_messages" DROP COLUMN "image_urls";
