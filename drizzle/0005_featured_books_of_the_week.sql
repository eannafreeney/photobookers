CREATE TABLE IF NOT EXISTS "featured_books_of_the_week" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "week_start" timestamp NOT NULL,
  "book_id" uuid NOT NULL,
  "position" integer NOT NULL,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp,
  CONSTRAINT "featured_books_week_position_unique" UNIQUE("week_start", "position"),
  CONSTRAINT "featured_books_book_unique" UNIQUE("book_id")
);

DO $$ BEGIN
  ALTER TABLE "featured_books_of_the_week"
  ADD CONSTRAINT "featured_books_of_the_week_book_id_books_id_fk"
  FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;