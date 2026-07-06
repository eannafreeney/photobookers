import { jsx } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import ValidateWebsite from "../../../features/auth/components/ValidateWebsite.js";
import { getCreatorByWebsite } from "../../../features/auth/services.js";
const POST = createRoute(async (c) => {
  const body = await c.req.parseBody();
  const website = body["website"];
  if (!website) return c.html(/* @__PURE__ */ jsx(ValidateWebsite, {}));
  const existingWebsite = await getCreatorByWebsite(website);
  const isAvailable = !Boolean(existingWebsite);
  return c.html(/* @__PURE__ */ jsx(ValidateWebsite, { isAvailable }));
});
export {
  POST
};
