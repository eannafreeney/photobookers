import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import {
  Behavior,
  Image,
  ScrollView,
  Style,
  Text,
  View
} from "../../../lib/hxml-comps.js";
const FeaturedSpotlightCard = ({
  label,
  title,
  imageUrl,
  href
}) => /* @__PURE__ */ jsxs(View, { style: "featured-spotlight-card", children: [
  /* @__PURE__ */ jsx(Behavior, { href }),
  imageUrl ? /* @__PURE__ */ jsx(
    Image,
    {
      source: imageUrl,
      style: "featured-spotlight-card-image",
      "resize-mode": "cover"
    }
  ) : /* @__PURE__ */ jsx(View, { style: "featured-spotlight-card-placeholder" }),
  /* @__PURE__ */ jsxs(View, { style: "featured-spotlight-card-overlay", children: [
    /* @__PURE__ */ jsx(Text, { style: "featured-spotlight-card-label", children: label.toUpperCase() }),
    /* @__PURE__ */ jsx(Text, { style: "featured-spotlight-card-title", children: title })
  ] })
] });
const FeaturedSpotlightCarousel = ({ items }) => {
  if (items.length === 0) return /* @__PURE__ */ jsx(Fragment, {});
  return /* @__PURE__ */ jsx(View, { style: "featured-spotlight-carousel", children: /* @__PURE__ */ jsx(
    ScrollView,
    {
      style: "featured-spotlight-scroll",
      horizontal: "true",
      "shows-scroll-indicator": "false",
      children: items.map((item) => /* @__PURE__ */ jsx(FeaturedSpotlightCard, { ...item }, item.id))
    }
  ) });
};
var FeaturedSpotlightCarousel_default = FeaturedSpotlightCarousel;
const featuredSpotlightCarouselStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx(Style, { id: "featured-spotlight-carousel" }),
  /* @__PURE__ */ jsx(Style, { id: "featured-spotlight-scroll", flexDirection: "row" }),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "featured-spotlight-card",
      width: 220,
      height: 280,
      borderRadius: 0,
      overflow: "hidden",
      marginRight: 12
    }
  ),
  /* @__PURE__ */ jsx(Style, { id: "featured-spotlight-card-image", width: 220, height: 280 }),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "featured-spotlight-card-placeholder",
      width: 220,
      height: 280,
      backgroundColor: "#e4e0d5"
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "featured-spotlight-card-overlay",
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.45)",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "flex-end",
      padding: 16,
      gap: 4
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "featured-spotlight-card-label",
      fontSize: 10,
      fontWeight: "600",
      letterSpacing: 2,
      color: "rgba(255,255,255,0.8)",
      textAlign: "center"
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "featured-spotlight-card-title",
      fontFamily: "Fraunces-Medium",
      fontSize: 19,
      color: "#fbfaf7",
      textAlign: "center"
    }
  )
] });
export {
  FeaturedSpotlightCarousel_default as default,
  featuredSpotlightCarouselStyles
};
