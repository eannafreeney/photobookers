import { jsx } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import ValidateDisplayName from "../../../features/auth/components/ValidateDisplayName.js";
import { slugify } from "../../../utils.js";
import { getCreatorBySlug } from "../../../features/auth/services.js";
const POST = createRoute(async (c) => {
  const body = await c.req.parseBody();
  const displayName = body["displayName"];
  if (!displayName) return c.html(/* @__PURE__ */ jsx(ValidateDisplayName, {}));
  const slug = slugify(displayName.trim());
  const existingCreator = await getCreatorBySlug(slug);
  const isAvailable = !Boolean(existingCreator);
  return c.html(/* @__PURE__ */ jsx(ValidateDisplayName, { isAvailable }));
});
export {
  POST
};
