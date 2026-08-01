CREATE TABLE IF NOT EXISTS "book_lists" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "title" varchar(255) NOT NULL,
  "slug" varchar(255) NOT NULL,
  "description" text,
  "is_public" boolean DEFAULT false NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "book_list_items" (
  "list_id" uuid NOT NULL,
  "book_id" uuid NOT NULL,
  "position" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp DEFAULT now(),
  CONSTRAINT "book_list_items_list_id_book_id_pk" PRIMARY KEY("list_id","book_id")
);
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "book_lists"
    ADD CONSTRAINT "book_lists_user_id_users_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id")
    ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "book_lists"
    ADD CONSTRAINT "book_lists_user_slug_unique" UNIQUE("user_id","slug");
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "book_list_items"
    ADD CONSTRAINT "book_list_items_list_id_book_lists_id_fk"
    FOREIGN KEY ("list_id") REFERENCES "public"."book_lists"("id")
    ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "book_list_items"
    ADD CONSTRAINT "book_list_items_book_id_books_id_fk"
    FOREIGN KEY ("book_id") REFERENCES "public"."books"("id")
    ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
