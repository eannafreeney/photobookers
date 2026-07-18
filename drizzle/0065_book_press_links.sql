ALTER TABLE "books" ADD COLUMN "press_links" jsonb DEFAULT '[]'::jsonb NOT NULL;
