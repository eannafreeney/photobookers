-- Lock PostgREST (anon / authenticated keys) out of public tables.
-- The app reads/writes via DATABASE_URL (bypasses RLS). No policies on
-- purpose: missing policy = deny for API roles. Do not FORCE RLS.
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format(
      'ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',
      r.tablename
    );
  END LOOP;
END
$$;
