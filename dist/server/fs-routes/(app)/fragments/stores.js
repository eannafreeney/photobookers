import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import SectionHeader from "../../../components/app/SectionHeader.js";
import ViewAllLink from "../../../features/app/components/ViewAllLink.js";
import { getPublishedStores } from "../../../features/app/stores/services.js";
import Button from "../../../components/app/Button.js";
import StoresColumns from "../../../features/app/stores/components/StoresColumns.js";
const FEATURED_STORES_LIMIT = 9;
const GET = createRoute(async (c) => {
  const [error, result] = await getPublishedStores({
    page: 1,
    limit: FEATURED_STORES_LIMIT
  });
  if (error) return c.html(/* @__PURE__ */ jsx(Fragment, {}));
  const { stores } = result;
  if (stores.length === 0) return c.html(/* @__PURE__ */ jsx(Fragment, {}));
  return c.html(
    /* @__PURE__ */ jsxs("div", { id: "stores-fragment", children: [
      /* @__PURE__ */ jsx(SectionHeader, { kicker: "Shop Local", action: /* @__PURE__ */ jsx(ViewAllLink, { href: "/stores" }), children: "Bookstores" }),
      /* @__PURE__ */ jsx(StoresColumns, { stores }),
      /* @__PURE__ */ jsx("div", { class: " mt-8 flex md:hidden justify-center", children: /* @__PURE__ */ jsx("a", { href: "/stores", children: /* @__PURE__ */ jsx(Button, { variant: "solid", color: "primary", width: "xl", children: "View All Bookstores \u2192" }) }) })
    ] })
  );
});
export {
  GET
};
