import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { Behavior, Image, Style, Text, View } from "../../../lib/hxml-comps.js";
const formatLocation = (store) => [store.city, store.country].filter(Boolean).join(", ");
const StoreCard = ({ store, href, variant = "carousel" }) => {
  const location = formatLocation(store);
  const cardStyle = variant === "list" ? "store-list-card" : "store-card";
  const imageStyle = variant === "list" ? "store-list-card-image" : "store-card-image";
  const overlayStyle = variant === "list" ? "store-list-card-overlay" : "store-card-overlay";
  return /* @__PURE__ */ jsxs(View, { style: cardStyle, children: [
    /* @__PURE__ */ jsx(Behavior, { href }),
    store.coverUrl ? /* @__PURE__ */ jsx(
      Image,
      {
        source: store.coverUrl,
        style: imageStyle,
        "resize-mode": "cover"
      }
    ) : /* @__PURE__ */ jsx(View, { style: imageStyle }),
    /* @__PURE__ */ jsxs(View, { style: overlayStyle, children: [
      /* @__PURE__ */ jsx(Text, { style: "store-card-eyebrow", children: "BOOKSTORE" }),
      /* @__PURE__ */ jsx(Text, { style: "store-card-name", children: store.name }),
      location ? /* @__PURE__ */ jsx(Text, { style: "store-card-location", children: location }) : null
    ] })
  ] }, store.id);
};
var StoreCard_default = StoreCard;
const storeCardStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "store-card",
      width: 220,
      height: 256,
      overflow: "hidden",
      marginRight: 12,
      backgroundColor: "#e4e0d5"
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "store-card-image",
      width: 220,
      height: 256,
      backgroundColor: "#e4e0d5"
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "store-list-card",
      width: "100%",
      height: 280,
      overflow: "hidden",
      marginBottom: 16,
      backgroundColor: "#e4e0d5"
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "store-list-card-image",
      width: "100%",
      height: 280,
      backgroundColor: "#e4e0d5"
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "store-card-overlay",
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.45)",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
      gap: 4
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "store-list-card-overlay",
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.45)",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
      gap: 4
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "store-card-eyebrow",
      fontSize: 10,
      fontWeight: "600",
      letterSpacing: 2,
      color: "rgba(255,255,255,0.75)"
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "store-card-name",
      fontFamily: "Fraunces-Medium",
      fontSize: 22,
      color: "#fbfaf7",
      textAlign: "center"
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "store-card-location",
      fontSize: 11,
      color: "rgba(255,255,255,0.7)",
      textAlign: "center"
    }
  )
] });
export {
  StoreCard_default as default,
  storeCardStyles
};
