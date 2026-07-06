import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { hyperview } from "../../../../../lib/hxml.js";
import FeaturedHomeBody from "../../../../../features/hyperview/components/FeaturedHomeBody.js";
import { getBaseUrl } from "../../../../../lib/hyperview.js";
import { getUser } from "../../../../../utils.js";
import BooksUpdatedListener from "../../../../../features/hyperview/components/BooksUpdatedListener.js";
const GET = createRoute(async (c) => {
  const baseUrl = getBaseUrl(c);
  const user = await getUser(c);
  const hv = hyperview(c);
  return hv(
    /* @__PURE__ */ jsxs("view", { xmlns: "https://hyperview.org/hyperview", style: "tab-fragment", children: [
      /* @__PURE__ */ jsx(
        BooksUpdatedListener,
        {
          refreshHref: `${baseUrl}/hyperview/featured/tab/home-content`
        }
      ),
      /* @__PURE__ */ jsx(FeaturedHomeBody, { baseUrl, user })
    ] })
  );
});
export {
  GET
};
