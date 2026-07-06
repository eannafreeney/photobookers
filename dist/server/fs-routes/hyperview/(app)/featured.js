import { jsx } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import FeaturedScreen from "../../../features/hyperview/components/FeaturedScreen.js";
import { hyperview } from "../../../lib/hxml.js";
import { getBaseUrl } from "../../../lib/hyperview.js";
import { getUser } from "../../../utils.js";
const GET = createRoute(async (c) => {
  const baseUrl = getBaseUrl(c);
  const user = await getUser(c);
  const hv = hyperview(c);
  return hv(/* @__PURE__ */ jsx(FeaturedScreen, { baseUrl, user }));
});
export {
  GET
};
