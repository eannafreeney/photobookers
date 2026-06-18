CREATE TYPE "public"."purchase_click_source" AS ENUM('web', 'hyperview');--> statement-breakpoint
CREATE TABLE "purchase_clicks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"book_id" uuid NOT NULL,
	"user_id" uuid,
	"source" "purchase_click_source" DEFAULT 'web' NOT NULL,
	"referer" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "purchase_clicks" ADD CONSTRAINT "purchase_clicks_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_clicks" ADD CONSTRAINT "purchase_clicks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "purchase_clicks_book_id_idx" ON "purchase_clicks" USING btree ("book_id");--> statement-breakpoint
CREATE INDEX "purchase_clicks_created_at_idx" ON "purchase_clicks" USING btree ("created_at");
