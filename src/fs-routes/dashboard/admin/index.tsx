import { createRoute } from "hono-fsr";
import { Context } from "hono";

// The admin area has no standalone landing page; send the bare path to the
// first section so /dashboard/admin never 404s (e.g. the admin server-error
// notification links here).
export const GET = createRoute((c: Context) =>
  c.redirect("/dashboard/admin/notifications", 302),
);
