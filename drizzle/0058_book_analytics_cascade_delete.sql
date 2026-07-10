ALTER TABLE "purchase_clicks" DROP CONSTRAINT "purchase_clicks_book_id_books_id_fk";--> statement-breakpoint
ALTER TABLE "purchase_clicks" ADD CONSTRAINT "purchase_clicks_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "book_views" DROP CONSTRAINT "book_views_book_id_books_id_fk";--> statement-breakpoint
ALTER TABLE "book_views" ADD CONSTRAINT "book_views_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;
