import { jsx } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { TERMS_SECTIONS } from "../../../features/legal/termsContent.js";
import { AppLayout } from "../+layout.js";
import { getBaseUrl } from "../../../lib/hyperview.js";
import { getUser } from "../../../utils.js";
import { hyperview } from "../../../lib/hxml.js";
import LegalText from "../../../features/hyperview/components/LegalText.js";
const GET = createRoute(async (c) => {
  const hv = hyperview(c);
  const baseUrl = getBaseUrl(c);
  const user = await getUser(c);
  return hv(
    /* @__PURE__ */ jsx(
      AppLayout,
      {
        title: "Terms and Conditions",
        user,
        showDock: true,
        baseUrl,
        dockActive: "about",
        children: /* @__PURE__ */ jsx("view", { id: "page-content", style: "page-content", children: /* @__PURE__ */ jsx(LegalText, { sections: TERMS_SECTIONS }) })
      }
    )
  );
});
export {
  GET
};
