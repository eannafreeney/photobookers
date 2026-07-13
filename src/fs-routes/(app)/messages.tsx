import { createRoute } from "hono-fsr";

export const GET = createRoute((c) => c.redirect("/feed", 302));
