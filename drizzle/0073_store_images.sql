CREATE TABLE "store_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"store_id" uuid NOT NULL,
	"image_url" text NOT NULL,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "store_images" ADD CONSTRAINT "store_images_store_id_book_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."book_stores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "store_images_store_id_idx" ON "store_images" USING btree ("store_id");
