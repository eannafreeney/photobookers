CREATE TABLE IF NOT EXISTS "post_likes" (
	"user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
	"post_id" uuid NOT NULL REFERENCES "collector_posts"("id") ON DELETE CASCADE,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "post_likes_user_id_post_id_pk" PRIMARY KEY("user_id","post_id")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "post_likes_post_id_idx" ON "post_likes" ("post_id");
--> statement-breakpoint
DROP TABLE IF EXISTS "likes";
