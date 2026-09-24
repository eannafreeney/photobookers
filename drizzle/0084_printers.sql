DO $$ BEGIN
  CREATE TYPE "public"."printer_status" AS ENUM('draft', 'published');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "printers" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "slug" varchar(255) NOT NULL,
  "name" text NOT NULL,
  "email" varchar(255) NOT NULL,
  "city" varchar(255) NOT NULL,
  "country" varchar(255) NOT NULL,
  "latitude" double precision,
  "longitude" double precision,
  "website" text,
  "description" text,
  "specialties" text,
  "status" "printer_status" DEFAULT 'draft' NOT NULL,
  "sort_order" integer,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp,
  CONSTRAINT "printers_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "printer_images" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "printer_id" uuid NOT NULL,
  "image_url" text NOT NULL,
  "sort_order" integer DEFAULT 0,
  "created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "print_quote_requests" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "copies" integer NOT NULL,
  "page_count" integer NOT NULL,
  "trim_size" text NOT NULL,
  "binding" text NOT NULL,
  "deadline" text NOT NULL,
  "ship_to_country" text NOT NULL,
  "reference_books" text,
  "message" text,
  "created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "print_quote_recipients" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "request_id" uuid NOT NULL,
  "printer_id" uuid NOT NULL,
  "email_sent_at" timestamp,
  "email_error" text,
  CONSTRAINT "print_quote_recipients_request_printer_unique" UNIQUE("request_id","printer_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "print_quote_notes" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "printer_id" uuid NOT NULL,
  "request_id" uuid NOT NULL,
  "replied" boolean DEFAULT false NOT NULL,
  "printed" boolean DEFAULT false NOT NULL,
  "body" text NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "print_quote_notes_user_printer_unique" UNIQUE("user_id","printer_id")
);
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "printer_images" ADD CONSTRAINT "printer_images_printer_id_printers_id_fk" FOREIGN KEY ("printer_id") REFERENCES "public"."printers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "print_quote_requests" ADD CONSTRAINT "print_quote_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "print_quote_recipients" ADD CONSTRAINT "print_quote_recipients_request_id_print_quote_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."print_quote_requests"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "print_quote_recipients" ADD CONSTRAINT "print_quote_recipients_printer_id_printers_id_fk" FOREIGN KEY ("printer_id") REFERENCES "public"."printers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "print_quote_notes" ADD CONSTRAINT "print_quote_notes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "print_quote_notes" ADD CONSTRAINT "print_quote_notes_printer_id_printers_id_fk" FOREIGN KEY ("printer_id") REFERENCES "public"."printers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "print_quote_notes" ADD CONSTRAINT "print_quote_notes_request_id_print_quote_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."print_quote_requests"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "printers_country_idx" ON "printers" USING btree ("country");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "print_quote_recipients_printer_idx" ON "print_quote_recipients" USING btree ("printer_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "print_quote_notes_printer_idx" ON "print_quote_notes" USING btree ("printer_id");
--> statement-breakpoint
ALTER TABLE "printers" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "printer_images" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "print_quote_requests" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "print_quote_recipients" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "print_quote_notes" ENABLE ROW LEVEL SECURITY;
