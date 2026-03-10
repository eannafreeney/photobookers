CREATE TABLE IF NOT EXISTS "artist_of_the_week" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "week_start" timestamp NOT NULL,
  "creator_id" uuid NOT NULL,
  "text" text DEFAULT '' NOT NULL,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp
);

CREATE TABLE IF NOT EXISTS "publisher_of_the_week" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "week_start" timestamp NOT NULL,
  "creator_id" uuid NOT NULL,
  "text" text DEFAULT '' NOT NULL,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp
);

ALTER TABLE "artist_of_the_week" ADD CONSTRAINT "artist_of_the_week_week_unique" UNIQUE("week_start");
ALTER TABLE "artist_of_the_week" ADD CONSTRAINT "artist_of_the_week_creator_id_creators_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."creators"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "publisher_of_the_week" ADD CONSTRAINT "publisher_of_the_week_week_unique" UNIQUE("week_start");
ALTER TABLE "publisher_of_the_week" ADD CONSTRAINT "publisher_of_the_week_creator_id_creators_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."creators"("id") ON DELETE cascade ON UPDATE no action;