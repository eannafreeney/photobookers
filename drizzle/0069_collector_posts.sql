CREATE TABLE IF NOT EXISTS "collector_posts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "body" text NOT NULL,
  "image_url" text,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp
);
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "collector_posts"
    ADD CONSTRAINT "collector_posts_user_id_users_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id")
    ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
