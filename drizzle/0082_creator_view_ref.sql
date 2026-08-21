ALTER TABLE "creator_views" ADD COLUMN IF NOT EXISTS "ref" varchar(32);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "creator_views_creator_ref_idx" ON "creator_views" ("creator_id","ref");
