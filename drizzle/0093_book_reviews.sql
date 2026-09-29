DO $$ BEGIN
  CREATE TYPE "public"."review_request_status" AS ENUM('requested', 'approved', 'declined', 'sent', 'reviewed');
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "reviewer_profiles" (
  "user_id" uuid PRIMARY KEY NOT NULL,
  "slug" varchar(255) NOT NULL,
  "display_name" text NOT NULL,
  "bio" text,
  "website" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp,
  CONSTRAINT "reviewer_profiles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "book_review_availability" (
  "book_id" uuid PRIMARY KEY NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "book_reviews" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "book_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "title" text NOT NULL,
  "body" text NOT NULL,
  "external_url" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp,
  CONSTRAINT "book_reviews_user_book" UNIQUE("book_id","user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "review_requests" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "book_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "status" "review_request_status" DEFAULT 'requested' NOT NULL,
  "note" text,
  "review_id" uuid,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp,
  CONSTRAINT "review_requests_user_book" UNIQUE("book_id","user_id")
);
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "reviewer_profiles" ADD CONSTRAINT "reviewer_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "book_review_availability" ADD CONSTRAINT "book_review_availability_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "book_reviews" ADD CONSTRAINT "book_reviews_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "book_reviews" ADD CONSTRAINT "book_reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "review_requests" ADD CONSTRAINT "review_requests_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "review_requests" ADD CONSTRAINT "review_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "review_requests" ADD CONSTRAINT "review_requests_review_id_book_reviews_id_fk" FOREIGN KEY ("review_id") REFERENCES "public"."book_reviews"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "book_reviews_book_id_idx" ON "book_reviews" USING btree ("book_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "book_reviews_user_id_idx" ON "book_reviews" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "review_requests_book_id_idx" ON "review_requests" USING btree ("book_id");
--> statement-breakpoint
ALTER TABLE "reviewer_profiles" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "book_review_availability" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "book_reviews" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "review_requests" ENABLE ROW LEVEL SECURITY;
