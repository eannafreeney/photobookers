import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { Behavior, Image, Style, Text, View } from "../../../lib/hxml-comps.js";
import { buildGoogleMapsUrl } from "../../app/stores/googleMaps.js";
const formatLocation = (store) => [store.city, store.country].filter(Boolean).join(", ");
const StoreDetailBody = ({ store }) => {
  const location = formatLocation(store);
  const mapsUrl = store.address ? buildGoogleMapsUrl(store.name, store.address) : null;
  return /* @__PURE__ */ jsxs(View, { style: "store-detail", children: [
    store.coverUrl ? /* @__PURE__ */ jsx(
      Image,
      {
        source: store.coverUrl,
        style: "store-detail-banner",
        "resize-mode": "cover"
      }
    ) : null,
    /* @__PURE__ */ jsx(Text, { style: "store-detail-title", children: store.name }),
    /* @__PURE__ */ jsxs(View, { style: "store-detail-meta", children: [
      location ? /* @__PURE__ */ jsx(View, { style: "store-detail-pill", children: /* @__PURE__ */ jsx(Text, { style: "store-detail-pill-text", children: location }) }) : null,
      store.address ? /* @__PURE__ */ jsx(View, { style: "store-detail-pill", children: /* @__PURE__ */ jsx(Text, { style: "store-detail-pill-text", children: store.address }) }) : null
    ] }),
    store.description ? /* @__PURE__ */ jsx(View, { style: "store-detail-description", children: /* @__PURE__ */ jsx(Text, { style: "store-detail-description-text", children: store.description }) }) : null,
    mapsUrl ? /* @__PURE__ */ jsxs(View, { style: "store-detail-website-btn", children: [
      /* @__PURE__ */ jsx(Text, { style: "store-detail-website-label", children: "Open in Google Maps" }),
      /* @__PURE__ */ jsx(Behavior, { href: mapsUrl, action: "deep-link" })
    ] }) : null,
    store.website ? /* @__PURE__ */ jsxs(View, { style: "store-detail-website-btn", children: [
      /* @__PURE__ */ jsx(Text, { style: "store-detail-website-label", children: "Visit Bookstore Website" }),
      /* @__PURE__ */ jsx(Behavior, { href: store.website, action: "deep-link" })
    ] }) : null
  ] });
};
var StoreDetailBody_default = StoreDetailBody;
const storeDetailBodyStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "store-detail",
      flexDirection: "column",
      gap: 16,
      paddingBottom: 32
    }
  ),
  /* @__PURE__ */ jsx(Style, { id: "store-detail-banner", width: "100%", height: 220 }),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "store-detail-title",
      fontFamily: "Fraunces-SemiBold",
      fontSize: 28,
      color: "#191613",
      textAlign: "center",
      lineHeight: 34,
      marginTop: 8
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "store-detail-meta",
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: 8
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "store-detail-pill",
      backgroundColor: "#f2efe8",
      borderRadius: 20,
      paddingTop: 8,
      paddingBottom: 8,
      paddingLeft: 14,
      paddingRight: 14
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "store-detail-pill-text",
      fontSize: 13,
      fontWeight: "500",
      color: "#191613"
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "store-detail-description",
      backgroundColor: "#f2efe8",
      borderRadius: 12,
      padding: 16,
      marginTop: 8
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "store-detail-description-text",
      fontSize: 15,
      color: "#45413a",
      lineHeight: 22
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "store-detail-website-btn",
      borderWidth: 1,
      borderColor: "#191613",
      borderRadius: 0,
      paddingTop: 14,
      paddingBottom: 14,
      alignItems: "center",
      marginTop: 8
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "store-detail-website-label",
      fontSize: 15,
      fontWeight: "600",
      color: "#191613"
    }
  )
] });
export {
  StoreDetailBody_default as default,
  storeDetailBodyStyles
};
