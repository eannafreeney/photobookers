import { createRoute } from "hono-fsr";
import { Context } from "hono";
import ValidateDisplayName from "../../../features/auth/components/ValidateDisplayName";
import { slugify } from "../../../utils";
import { getCreatorBySlug } from "../../../features/auth/services";

export const POST = createRoute(async (c: Context) => {
  const body = await c.req.parseBody();
  const displayName = body["displayName"] as string | undefined;
  if (!displayName) return c.html(<ValidateDisplayName />);

  const slug = slugify(displayName.trim());
  const existingCreator = await getCreatorBySlug(slug);
  const isAvailable = !Boolean(existingCreator);

  return c.html(<ValidateDisplayName isAvailable={isAvailable} />);
});
