CREATE TYPE "public"."book_store_approval_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."book_store_status" AS ENUM('draft', 'published');--> statement-breakpoint
CREATE TABLE "book_stores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(255) NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"address" text NOT NULL,
	"city" varchar(255) NOT NULL,
	"country" varchar(255) NOT NULL,
	"website" text,
	"cover_url" text,
	"banner_url" text,
	"status" "book_store_status" DEFAULT 'draft' NOT NULL,
	"approval_status" "book_store_approval_status" DEFAULT 'pending' NOT NULL,
	"sort_order" integer,
	"created_by_user_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	CONSTRAINT "book_stores_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "book_stores" ADD CONSTRAINT "book_stores_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "book_stores_country_idx" ON "book_stores" USING btree ("country");