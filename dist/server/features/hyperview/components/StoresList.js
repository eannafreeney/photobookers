import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { Style } from "../../../lib/hxml-comps.js";
import StoreCard, { storeCardStyles } from "./StoreCard.js";
const StoresList = ({ stores, baseUrl }) => {
  if (stores.length === 0) return /* @__PURE__ */ jsx(Fragment, {});
  return /* @__PURE__ */ jsx(Fragment, { children: stores.map((store) => /* @__PURE__ */ jsx(
    StoreCard,
    {
      store,
      variant: "list",
      href: `${baseUrl}/hyperview/stores/${store.slug}`
    },
    store.id
  )) });
};
var StoresList_default = StoresList;
const StoresListMessage = ({ children }) => /* @__PURE__ */ jsx("view", { xmlns: "https://hyperview.org/hyperview", style: "tab-fragment", children });
const storesListStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  storeCardStyles(),
  /* @__PURE__ */ jsx(Style, { id: "stores-list", flexDirection: "column" }),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "stores-empty-message",
      fontSize: 14,
      color: "#45413a",
      lineHeight: 22,
      paddingTop: 24,
      paddingLeft: 16,
      paddingRight: 16
    }
  )
] });
export {
  StoresListMessage,
  StoresList_default as default,
  storesListStyles
};
