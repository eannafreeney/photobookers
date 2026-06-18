CREATE TYPE "public"."book_view_source" AS ENUM('web', 'hyperview');--> statement-breakpoint
CREATE TABLE "book_views" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"book_id" uuid NOT NULL,
	"user_id" uuid,
	"source" "book_view_source" DEFAULT 'web' NOT NULL,
	"referer" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "book_views" ADD CONSTRAINT "book_views_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "book_views" ADD CONSTRAINT "book_views_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "book_views_book_id_idx" ON "book_views" USING btree ("book_id");--> statement-breakpoint
CREATE INDEX "book_views_created_at_idx" ON "book_views" USING btree ("created_at");