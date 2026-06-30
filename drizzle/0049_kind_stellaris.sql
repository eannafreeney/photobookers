CREATE TYPE "public"."creator_view_source" AS ENUM('web', 'hyperview');--> statement-breakpoint
CREATE TABLE "creator_views" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" uuid NOT NULL,
	"user_id" uuid,
	"source" "creator_view_source" DEFAULT 'web' NOT NULL,
	"referer" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "creator_views" ADD CONSTRAINT "creator_views_creator_id_creators_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."creators"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_views" ADD CONSTRAINT "creator_views_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "creator_views_creator_id_idx" ON "creator_views" USING btree ("creator_id");--> statement-breakpoint
CREATE INDEX "creator_views_created_at_idx" ON "creator_views" USING btree ("created_at");