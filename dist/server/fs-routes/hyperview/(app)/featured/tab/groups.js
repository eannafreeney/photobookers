import { jsx } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import BookGroups from "../../../../../features/hyperview/components/BookGroups.js";
import { hyperview } from "../../../../../lib/hxml.js";
import { getBaseUrl } from "../../../../../lib/hyperview.js";
const GET = createRoute(async (c) => {
  const hv = hyperview(c);
  const baseUrl = getBaseUrl(c);
  return hv(
    /* @__PURE__ */ jsx("view", { xmlns: "https://hyperview.org/hyperview", children: /* @__PURE__ */ jsx(BookGroups, { baseUrl }) })
  );
});
export {
  GET
};
