CREATE TYPE "public"."book_fair_approval_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."book_fair_listing_tier" AS ENUM('free', 'promoted');--> statement-breakpoint
CREATE TYPE "public"."book_fair_status" AS ENUM('draft', 'published', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."fair_attendee_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TABLE "book_fairs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(255) NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"city" varchar(255),
	"country" varchar(255),
	"venue" text,
	"website" text,
	"cover_url" text,
	"banner_url" text,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"status" "book_fair_status" DEFAULT 'draft' NOT NULL,
	"approval_status" "book_fair_approval_status" DEFAULT 'pending' NOT NULL,
	"listing_tier" "book_fair_listing_tier" DEFAULT 'free' NOT NULL,
	"promoted_until" timestamp,
	"sort_order" integer,
	"created_by_user_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	CONSTRAINT "book_fairs_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "fair_attendees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fair_id" uuid NOT NULL,
	"creator_id" uuid NOT NULL,
	"status" "fair_attendee_status" DEFAULT 'approved' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp,
	CONSTRAINT "fair_attendees_fair_creator_unique" UNIQUE("fair_id","creator_id")
);
--> statement-breakpoint
ALTER TABLE "book_fairs" ADD CONSTRAINT "book_fairs_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fair_attendees" ADD CONSTRAINT "fair_attendees_fair_id_book_fairs_id_fk" FOREIGN KEY ("fair_id") REFERENCES "public"."book_fairs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fair_attendees" ADD CONSTRAINT "fair_attendees_creator_id_creators_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."creators"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "book_fairs_start_date_idx" ON "book_fairs" USING btree ("start_date");--> statement-breakpoint
CREATE INDEX "fair_attendees_fair_id_idx" ON "fair_attendees" USING btree ("fair_id");--> statement-breakpoint
CREATE INDEX "fair_attendees_creator_id_idx" ON "fair_attendees" USING btree ("creator_id");