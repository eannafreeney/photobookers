CREATE TABLE IF NOT EXISTS "printer_books" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "printer_id" uuid NOT NULL,
  "book_id" uuid NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "printer_books_printer_book_unique" UNIQUE("printer_id", "book_id")
);
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "printer_books" ADD CONSTRAINT "printer_books_printer_id_printers_id_fk" FOREIGN KEY ("printer_id") REFERENCES "public"."printers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "printer_books" ADD CONSTRAINT "printer_books_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "printer_books_printer_idx" ON "printer_books" USING btree ("printer_id");
--> statement-breakpoint
ALTER TABLE "printer_books" ENABLE ROW LEVEL SECURITY;
