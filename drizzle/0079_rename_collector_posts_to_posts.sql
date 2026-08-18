DO $$ BEGIN
  IF to_regclass('public.collector_posts') IS NOT NULL
     AND to_regclass('public.posts') IS NULL THEN
    ALTER TABLE "collector_posts" RENAME TO "posts";
  END IF;
END $$;
