import { createRoute } from "hono-fsr";
import ValidateWebsite from "../../../features/auth/components/ValidateWebsite";
import { getCreatorByWebsite } from "../../../features/auth/services";
import { Context } from "hono";

export const POST = createRoute(async (c: Context) => {
  const body = await c.req.parseBody();
  const website = body["website"] as string | undefined;
  if (!website) return c.html(<ValidateWebsite />);

  const existingWebsite = await getCreatorByWebsite(website);
  const isAvailable = !Boolean(existingWebsite);

  return c.html(<ValidateWebsite isAvailable={isAvailable} />);
});
