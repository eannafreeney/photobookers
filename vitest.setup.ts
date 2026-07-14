// Placeholder Supabase credentials so modules that create Supabase clients at
// import time (src/lib/supabase.ts) don't throw when tests transitively import them.
// Only set fallbacks; never override real values a developer/CI may have provided.
process.env.SUPABASE_URL ||= "http://localhost:54321";
process.env.SUPABASE_ANON_KEY ||= "test-anon-key";
process.env.SUPABASE_SERVICE_ROLE_KEY ||= "test-service-role-key";
