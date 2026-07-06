import { jsx } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import FairsSection from "../../../../../features/hyperview/components/FairsSection.js";
import { hyperview } from "../../../../../lib/hxml.js";
import { getBaseUrl } from "../../../../../lib/hyperview.js";
import { getUser } from "../../../../../utils.js";
import { isFeatureEnabledForUser } from "../../../../../lib/features.js";
const GET = createRoute(async (c) => {
  const hv = hyperview(c);
  const baseUrl = getBaseUrl(c);
  const user = await getUser(c);
  if (!isFeatureEnabledForUser("fairs", user)) {
    return hv(/* @__PURE__ */ jsx("view", { xmlns: "https://hyperview.org/hyperview" }));
  }
  return hv(
    /* @__PURE__ */ jsx("view", { xmlns: "https://hyperview.org/hyperview", children: /* @__PURE__ */ jsx(FairsSection, { baseUrl }) })
  );
});
export {
  GET
};
