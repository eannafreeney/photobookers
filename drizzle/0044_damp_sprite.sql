CREATE TYPE "public"."fair_view_source" AS ENUM('web', 'hyperview');--> statement-breakpoint
CREATE TABLE "fair_views" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fair_id" uuid NOT NULL,
	"user_id" uuid,
	"source" "fair_view_source" DEFAULT 'web' NOT NULL,
	"referer" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "fair_views" ADD CONSTRAINT "fair_views_fair_id_book_fairs_id_fk" FOREIGN KEY ("fair_id") REFERENCES "public"."book_fairs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fair_views" ADD CONSTRAINT "fair_views_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "fair_views_fair_id_idx" ON "fair_views" USING btree ("fair_id");--> statement-breakpoint
CREATE INDEX "fair_views_created_at_idx" ON "fair_views" USING btree ("created_at");