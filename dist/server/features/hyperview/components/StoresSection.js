import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { ScrollView, Style, View } from "../../../lib/hxml-comps.js";
import { getPublishedStores } from "../../app/stores/services.js";
import SectionHeader from "./SectionHeader.js";
import StoreCard, { storeCardStyles } from "./StoreCard.js";
const FEATURED_STORES_LIMIT = 5;
const StoresSection = async ({ baseUrl }) => {
  const [error, result] = await getPublishedStores({
    page: 1,
    limit: FEATURED_STORES_LIMIT
  });
  if (error) return /* @__PURE__ */ jsx(Fragment, {});
  const { stores } = result;
  if (stores.length === 0) return /* @__PURE__ */ jsx(Fragment, {});
  return /* @__PURE__ */ jsxs(View, { style: "stores-section", children: [
    /* @__PURE__ */ jsx(
      SectionHeader,
      {
        title: "Bookstores",
        viewAllHref: `${baseUrl}/hyperview/stores`
      }
    ),
    /* @__PURE__ */ jsx(
      ScrollView,
      {
        style: "stores-scroll",
        horizontal: "true",
        "shows-scroll-indicator": "false",
        children: stores.map((store) => /* @__PURE__ */ jsx(
          StoreCard,
          {
            store,
            href: `${baseUrl}/hyperview/stores/${store.slug}`
          }
        ))
      }
    )
  ] });
};
var StoresSection_default = StoresSection;
const storesSectionStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  storeCardStyles(),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "stores-section",
      flexDirection: "column",
      gap: 12,
      marginBottom: 12
    }
  ),
  /* @__PURE__ */ jsx(Style, { id: "stores-scroll", flexDirection: "row" })
] });
export {
  StoresSection_default as default,
  storesSectionStyles
};
