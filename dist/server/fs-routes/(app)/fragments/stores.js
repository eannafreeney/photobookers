import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import SectionTitle from "../../../components/app/SectionTitle.js";
import ViewAllLink from "../../../features/app/components/ViewAllLink.js";
import { getPublishedStores } from "../../../features/app/stores/services.js";
import StoresGrid from "../../../features/app/stores/components/StoresGrid.js";
import Button from "../../../components/app/Button.js";
import StoresSlider from "../../../features/app/stores/components/StoresSlider.js";
const FEATURED_STORES_LIMIT = 5;
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
      /* @__PURE__ */ jsxs("div", { class: "flex items-end justify-between mb-3 mt-10 border-t-2 border-on-surface-strong pt-3", children: [
        /* @__PURE__ */ jsx(SectionTitle, { className: "mb-0", kicker: "Shop Local", children: "Bookstores" }),
        /* @__PURE__ */ jsx(ViewAllLink, { href: "/stores" })
      ] }),
      /* @__PURE__ */ jsx("div", { class: "sm:hidden", children: /* @__PURE__ */ jsx(StoresSlider, { stores }) }),
      /* @__PURE__ */ jsx("div", { class: "hidden sm:block", children: /* @__PURE__ */ jsx(
        StoresGrid,
        {
          stores,
          page: 1,
          totalPages: 1,
          baseUrl: "/stores",
          targetId: "stores-fragment-grid"
        }
      ) }),
      /* @__PURE__ */ jsx("div", { class: " mt-8 flex md:hidden justify-center", children: /* @__PURE__ */ jsx("a", { href: "/stores", children: /* @__PURE__ */ jsx(Button, { variant: "solid", color: "primary", width: "xl", children: "View All Bookstores \u2192" }) }) })
    ] })
  );
});
export {
  GET
};
