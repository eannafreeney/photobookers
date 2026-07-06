import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { Behavior, Image, Style, Text, View } from "../../../lib/hxml-comps.js";
import { formatDate, formatDateWithoutYear } from "../../../utils.js";
const formatLocation = (fair) => {
  if (fair.city && fair.country) return `${fair.city}, ${fair.country}`;
  return fair.city || fair.country || null;
};
const FairCard = ({ fair, href, variant = "carousel" }) => {
  const cardStyle = variant === "list" ? "fair-list-card" : "fair-card";
  const imageStyle = variant === "list" ? "fair-list-card-image" : "fair-card-image";
  const overlayStyle = variant === "list" ? "fair-list-card-overlay" : "fair-card-overlay";
  const location = formatLocation(fair);
  return /* @__PURE__ */ jsxs(View, { style: cardStyle, children: [
    /* @__PURE__ */ jsx(Behavior, { href }),
    fair.coverUrl ? /* @__PURE__ */ jsx(Image, { source: fair.coverUrl, style: imageStyle, "resize-mode": "cover" }) : /* @__PURE__ */ jsx(View, { style: imageStyle }),
    /* @__PURE__ */ jsxs(View, { style: overlayStyle, children: [
      /* @__PURE__ */ jsx(Text, { style: "fair-card-eyebrow", children: "BOOK FAIR" }),
      /* @__PURE__ */ jsx(Text, { style: "fair-card-name", children: fair.name }),
      /* @__PURE__ */ jsxs(Text, { style: "fair-card-date", children: [
        formatDateWithoutYear(fair.startDate),
        " \u2013 ",
        formatDate(fair.endDate)
      ] }),
      location ? /* @__PURE__ */ jsx(Text, { style: "fair-card-location", children: location }) : null
    ] })
  ] });
};
var FairCard_default = FairCard;
const fairCardStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "fair-card",
      width: 220,
      height: 256,
      borderRadius: 0,
      overflow: "hidden",
      marginRight: 12
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "fair-card-image",
      width: 220,
      height: 256,
      backgroundColor: "#e4e0d5"
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "fair-list-card",
      width: "100%",
      height: 280,
      borderRadius: 0,
      overflow: "hidden",
      marginBottom: 16
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "fair-list-card-image",
      width: "100%",
      height: 280,
      backgroundColor: "#e4e0d5"
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "fair-card-overlay",
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
      id: "fair-list-card-overlay",
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
      id: "fair-card-eyebrow",
      fontSize: 10,
      fontWeight: "600",
      letterSpacing: 2,
      color: "rgba(255,255,255,0.75)"
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "fair-card-name",
      fontFamily: "Fraunces-Medium",
      fontSize: 22,
      color: "#fbfaf7",
      textAlign: "center"
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "fair-card-date",
      fontSize: 11,
      color: "rgba(255,255,255,0.7)",
      textAlign: "center"
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "fair-card-location",
      fontSize: 11,
      color: "rgba(255,255,255,0.7)",
      textAlign: "center"
    }
  )
] });
export {
  FairCard_default as default,
  fairCardStyles
};
