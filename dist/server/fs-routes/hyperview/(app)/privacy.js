import { jsx } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { AppLayout } from "../+layout.js";
import { getBaseUrl } from "../../../lib/hyperview.js";
import { getUser } from "../../../utils.js";
import { hyperview } from "../../../lib/hxml.js";
import LegalText from "../../../features/hyperview/components/LegalText.js";
import { PRIVACY_SECTIONS } from "../../../features/legal/privacyContent.js";
const GET = createRoute(async (c) => {
  const hv = hyperview(c);
  const baseUrl = getBaseUrl(c);
  const user = await getUser(c);
  return hv(
    /* @__PURE__ */ jsx(
      AppLayout,
      {
        title: "Privacy Policy",
        user,
        showDock: true,
        baseUrl,
        dockActive: "about",
        children: /* @__PURE__ */ jsx("view", { id: "page-content", style: "page-content", children: /* @__PURE__ */ jsx(LegalText, { sections: PRIVACY_SECTIONS }) })
      }
    )
  );
});
export {
  GET
};
