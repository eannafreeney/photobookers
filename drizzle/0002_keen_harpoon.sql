DO $$ BEGIN
  CREATE TYPE "public"."book_approval_status" AS ENUM('pending', 'approved', 'rejected');
EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN
  CREATE TYPE "public"."book_availability_status" AS ENUM('sold_out', 'unavailable', 'available');
EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN
  CREATE TYPE "public"."book_publication_status" AS ENUM('published', 'draft');
EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN
  CREATE TYPE "public"."creator_claim_status" AS ENUM('pending', 'pending_admin_review', 'approved', 'rejected');
EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN
  CREATE TYPE "public"."follow_target" AS ENUM('user', 'creator');
EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN
  CREATE TYPE "public"."verification_method" AS ENUM('website', 'instagram');
EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "book_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"book_id" uuid NOT NULL,
	"image_url" text NOT NULL,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "book_of_the_day" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" timestamp NOT NULL,
	"book_id" uuid NOT NULL,
	"text" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp,
	CONSTRAINT "book_of_the_day_date_unique" UNIQUE("date"),
	CONSTRAINT "book_of_the_day_book_unique" UNIQUE("book_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "book_of_the_week" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"week_start" timestamp NOT NULL,
	"book_id" uuid NOT NULL,
	"text" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp,
	CONSTRAINT "book_of_the_week_week_unique" UNIQUE("week_start"),
	CONSTRAINT "book_of_the_week_book_unique" UNIQUE("book_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "collections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"book_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "creator_claims" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"status" "creator_claim_status" DEFAULT 'pending' NOT NULL,
	"requested_at" timestamp DEFAULT now(),
	"verified_at" timestamp,
	"creator_created_by_user_id" uuid,
	"token" varchar(255) NOT NULL,
	"verification_method" "verification_method" DEFAULT 'website',
	"verification_url" text,
	"verification_code" varchar(10),
	"code_expires_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "wishlists" (
	"user_id" uuid NOT NULL,
	"book_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "wishlists_user_id_book_id_pk" PRIMARY KEY("user_id","book_id")
);
--> statement-breakpoint
DROP TABLE IF EXISTS "book_artists" CASCADE;--> statement-breakpoint
ALTER TABLE "follows" DROP CONSTRAINT IF EXISTS "follows_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "follows" DROP CONSTRAINT IF EXISTS "follows_creator_id_creators_id_fk";
--> statement-breakpoint
ALTER TABLE "creators" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "creators" ALTER COLUMN "status" SET DEFAULT 'stub'::text;--> statement-breakpoint
DROP TYPE IF EXISTS "public"."creator_status";--> statement-breakpoint
DO $$ BEGIN
  CREATE TYPE "public"."creator_status" AS ENUM('stub', 'verified', 'suspended', 'deleted');
EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
ALTER TABLE "creators" ALTER COLUMN "status" SET DEFAULT 'stub'::"public"."creator_status";--> statement-breakpoint
ALTER TABLE "creators" ALTER COLUMN "status" SET DATA TYPE "public"."creator_status" USING "status"::"public"."creator_status";--> statement-breakpoint
ALTER TABLE "books" ALTER COLUMN "title" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "books" ALTER COLUMN "description" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "books" ALTER COLUMN "publisher_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "books" ALTER COLUMN "cover_url" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "creators" ALTER COLUMN "slug" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "creators" ALTER COLUMN "city" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "creators" ALTER COLUMN "city" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "creators" ALTER COLUMN "country" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "creators" ALTER COLUMN "country" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "books" ADD COLUMN IF NOT EXISTS "artist_id" uuid;--> statement-breakpoint
ALTER TABLE "books" ADD COLUMN IF NOT EXISTS "availability_status" "book_availability_status" DEFAULT 'available' NOT NULL;--> statement-breakpoint
ALTER TABLE "books" ADD COLUMN IF NOT EXISTS "approval_status" "book_approval_status" DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "books" ADD COLUMN IF NOT EXISTS "publication_status" "book_publication_status" DEFAULT 'draft';--> statement-breakpoint
ALTER TABLE "books" ADD COLUMN IF NOT EXISTS "purchase_link" text;--> statement-breakpoint
ALTER TABLE "books" ADD COLUMN IF NOT EXISTS "images" text[];--> statement-breakpoint
ALTER TABLE "books" ADD COLUMN IF NOT EXISTS "created_by_user_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "creators" ADD COLUMN IF NOT EXISTS "display_name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "creators" ADD COLUMN IF NOT EXISTS "tagline" text;--> statement-breakpoint
ALTER TABLE "creators" ADD COLUMN IF NOT EXISTS "bio" text;--> statement-breakpoint
ALTER TABLE "creators" ADD COLUMN IF NOT EXISTS "sort_name" varchar(255);--> statement-breakpoint
ALTER TABLE "creators" ADD COLUMN IF NOT EXISTS "created_by_user_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "follows" ADD COLUMN IF NOT EXISTS "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "follows" ADD COLUMN IF NOT EXISTS "follower_user_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "follows" ADD COLUMN IF NOT EXISTS "target_type" "follow_target" NOT NULL;--> statement-breakpoint
ALTER TABLE "follows" ADD COLUMN IF NOT EXISTS "target_user_id" uuid;--> statement-breakpoint
ALTER TABLE "follows" ADD COLUMN IF NOT EXISTS "target_creator_id" uuid;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "first_name" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "last_name" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "accepts_terms" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_admin" boolean DEFAULT false NOT NULL;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "book_images" ADD CONSTRAINT "book_images_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "book_of_the_day" ADD CONSTRAINT "book_of_the_day_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "book_of_the_week" ADD CONSTRAINT "book_of_the_week_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "collections" ADD CONSTRAINT "collections_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "collections" ADD CONSTRAINT "collections_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "creator_claims" ADD CONSTRAINT "creator_claims_creator_id_creators_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."creators"("id") ON DELETE no action ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "creator_claims" ADD CONSTRAINT "creator_claims_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "creator_claims" ADD CONSTRAINT "creator_claims_creator_created_by_user_id_users_id_fk" FOREIGN KEY ("creator_created_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "wishlists" ADD CONSTRAINT "wishlists_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "wishlists" ADD CONSTRAINT "wishlists_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "books" ADD CONSTRAINT "books_artist_id_creators_id_fk" FOREIGN KEY ("artist_id") REFERENCES "public"."creators"("id") ON DELETE no action ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "books" ADD CONSTRAINT "books_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "creators" ADD CONSTRAINT "creators_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "follows" ADD CONSTRAINT "follows_follower_user_id_users_id_fk" FOREIGN KEY ("follower_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "follows" ADD CONSTRAINT "follows_target_user_id_users_id_fk" FOREIGN KEY ("target_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "follows" ADD CONSTRAINT "follows_target_creator_id_creators_id_fk" FOREIGN KEY ("target_creator_id") REFERENCES "public"."creators"("id") ON DELETE no action ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
ALTER TABLE "books" DROP COLUMN IF EXISTS "short_description";--> statement-breakpoint
ALTER TABLE "books" DROP COLUMN IF EXISTS "artist_bio";--> statement-breakpoint
ALTER TABLE "books" DROP COLUMN IF EXISTS "is_sold_out";--> statement-breakpoint
ALTER TABLE "books" DROP COLUMN IF EXISTS "technical_info";--> statement-breakpoint
ALTER TABLE "books" DROP COLUMN IF EXISTS "price";--> statement-breakpoint
ALTER TABLE "books" DROP COLUMN IF EXISTS "reviews";--> statement-breakpoint
ALTER TABLE "books" DROP COLUMN IF EXISTS "website";--> statement-breakpoint
ALTER TABLE "creators" DROP COLUMN IF EXISTS "name";--> statement-breakpoint
ALTER TABLE "creators" DROP COLUMN IF EXISTS "description";--> statement-breakpoint
ALTER TABLE "follows" DROP COLUMN IF EXISTS "user_id";--> statement-breakpoint
ALTER TABLE "follows" DROP COLUMN IF EXISTS "creator_id";--> statement-breakpoint
ALTER TABLE "follows" DROP COLUMN IF EXISTS "updated_at";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "name";--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "follows" ADD CONSTRAINT "user_follow_unique" UNIQUE("follower_user_id","target_user_id","target_creator_id");
EXCEPTION
  WHEN duplicate_object THEN null;
  WHEN duplicate_table THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "books" ADD CONSTRAINT "cover_required_for_publish" CHECK ("books"."cover_url" IS NOT NULL OR "books"."publication_status" = 'draft'); EXCEPTION WHEN duplicate_object THEN null; END $$;