ALTER TABLE "books" ADD COLUMN IF NOT EXISTS "notify_followers_on_release" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "books" ADD COLUMN IF NOT EXISTS "notify_followers_scheduled_date" timestamp;--> statement-breakpoint
ALTER TABLE "books" ADD COLUMN IF NOT EXISTS "notify_followers_sent_at" timestamp;--> statement-breakpoint
ALTER TABLE "books" ADD COLUMN IF NOT EXISTS "notify_followers_creator_id" uuid;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "books" ADD CONSTRAINT "books_notify_followers_creator_id_creators_id_fk" FOREIGN KEY ("notify_followers_creator_id") REFERENCES "public"."creators"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;