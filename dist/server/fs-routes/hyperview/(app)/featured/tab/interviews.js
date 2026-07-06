import { jsx } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import Interviews from "../../../../../features/hyperview/components/Interviews.js";
import { hyperview } from "../../../../../lib/hxml.js";
import { getBaseUrl } from "../../../../../lib/hyperview.js";
const GET = createRoute(async (c) => {
  const hv = hyperview(c);
  const baseUrl = getBaseUrl(c);
  return hv(
    /* @__PURE__ */ jsx("view", { xmlns: "https://hyperview.org/hyperview", children: /* @__PURE__ */ jsx(Interviews, { baseUrl }) })
  );
});
export {
  GET
};
