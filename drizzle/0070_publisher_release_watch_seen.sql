CREATE TABLE IF NOT EXISTS "publisher_release_watch_seen" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"publisher_id" varchar(64) NOT NULL,
	"product_key" text NOT NULL,
	"title" text NOT NULL,
	"url" text NOT NULL,
	"first_seen_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "publisher_release_watch_seen_publisher_product_unique" UNIQUE("publisher_id","product_key")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "publisher_release_watch_seen_publisher_idx" ON "publisher_release_watch_seen" USING btree ("publisher_id");
