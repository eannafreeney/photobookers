import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { Behavior, Style, Text, View } from "../../../lib/hxml-comps.js";
const BookPurchaseButton = ({ purchaseHref }) => {
  return /* @__PURE__ */ jsx(View, { style: "book-purchase-wrap", children: /* @__PURE__ */ jsxs(View, { style: "purchase-btn", children: [
    /* @__PURE__ */ jsx(Behavior, { action: "deep-link", href: purchaseHref }),
    /* @__PURE__ */ jsx(Text, { style: "purchase-label", children: "See more" })
  ] }) });
};
var BookPurchaseButton_default = BookPurchaseButton;
const bookPurchaseButtonStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx(Style, { id: "book-purchase-wrap", marginTop: 4, marginBottom: 16 }),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "purchase-btn",
      paddingTop: 10,
      paddingBottom: 10,
      paddingLeft: 20,
      paddingRight: 20,
      borderRadius: 0,
      backgroundColor: "#191613",
      alignItems: "center"
    }
  ),
  /* @__PURE__ */ jsx(Style, { id: "purchase-label", fontSize: 14, fontWeight: "600", color: "#fbfaf7" })
] });
export {
  bookPurchaseButtonStyles,
  BookPurchaseButton_default as default
};
