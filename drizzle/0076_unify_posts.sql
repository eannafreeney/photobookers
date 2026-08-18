ALTER TABLE "collector_posts" ADD COLUMN IF NOT EXISTS "notify_followers_sent_at" timestamp;
--> statement-breakpoint
-- Move creator announcements onto the unified user-keyed posts table.
INSERT INTO "collector_posts" (
  "id",
  "user_id",
  "body",
  "image_url",
  "notify_followers_sent_at",
  "created_at",
  "updated_at"
)
SELECT
  cm."id",
  c."owner_user_id",
  cm."body",
  cm."image_url",
  cm."notify_followers_sent_at",
  cm."created_at",
  cm."updated_at"
FROM "creator_messages" cm
INNER JOIN "creators" c ON c."id" = cm."creator_id"
WHERE c."owner_user_id" IS NOT NULL
ON CONFLICT ("id") DO NOTHING;
--> statement-breakpoint
DROP TABLE IF EXISTS "creator_messages";
