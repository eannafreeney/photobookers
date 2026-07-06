import { jsx } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { hyperview } from "../../../../../lib/hxml.js";
import { TERMS_SECTIONS } from "../../../../../features/legal/termsContent.js";
import LegalText from "../../../../../features/hyperview/components/LegalText.js";
const GET = createRoute(async (c) => {
  const hv = hyperview(c);
  return hv(
    /* @__PURE__ */ jsx("view", { xmlns: "https://hyperview.org/hyperview", style: "tab-fragment", children: /* @__PURE__ */ jsx(LegalText, { sections: TERMS_SECTIONS }) })
  );
});
export {
  GET
};
